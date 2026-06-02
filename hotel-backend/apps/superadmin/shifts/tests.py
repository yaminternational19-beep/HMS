from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from apps.authentication.models import SuperAdmin
from core.services.jwt_service import JWTService
from .models import Shifts
from .validators import (
    validate_shift_name,
    validate_shift_time,
    validate_shift_icon,
    validate_shift_color
)
from .serializers import ShiftsSerializer


class ShiftsValidatorTestCase(TestCase):
    """
    Unit tests validating individual field validation business rules.
    """

    def test_validate_shift_name_success(self):
        try:
            validate_shift_name("Morning Shift")
            validate_shift_name("Late-Night Guard")
            validate_shift_name("Weekend_Roster 12")
        except ValueError as ve:
            self.fail(f"validate_shift_name failed unexpectedly: {ve}")

    def test_validate_shift_name_failures(self):
        # Too short
        with self.assertRaises(ValueError):
            validate_shift_name("Sh")
        # Too long (151 chars)
        with self.assertRaises(ValueError):
            validate_shift_name("a" * 151)
        # Invalid characters (e.g. @, #, etc.)
        with self.assertRaises(ValueError):
            validate_shift_name("Shift #1")

    def test_validate_shift_time_success(self):
        try:
            validate_shift_time("07:00 AM - 03:00 PM")
            validate_shift_time("11:30 PM - 08:30 AM")
            validate_shift_time("12:00 AM - 12:00 PM")
        except ValueError as ve:
            self.fail(f"validate_shift_time failed unexpectedly: {ve}")

    def test_validate_shift_time_failures(self):
        # Missing hyphen
        with self.assertRaises(ValueError):
            validate_shift_time("09:00 AM 05:00 PM")
        # Invalid hour
        with self.assertRaises(ValueError):
            validate_shift_time("13:00 AM - 05:00 PM")
        # Invalid minute
        with self.assertRaises(ValueError):
            validate_shift_time("09:65 AM - 05:00 PM")
        # Incorrect modifier
        with self.assertRaises(ValueError):
            validate_shift_time("09:00 GM - 05:00 PM")

    def test_validate_shift_icon_and_color_success(self):
        try:
            validate_shift_icon("sun")
            validate_shift_icon("clock")
            validate_shift_color("blue")
            validate_shift_color("purple")
        except ValueError as ve:
            self.fail(f"Icon or Color validation failed unexpectedly: {ve}")

    def test_validate_shift_icon_and_color_failures(self):
        # Invalid icon
        with self.assertRaises(ValueError):
            validate_shift_icon("star")
        # Invalid color
        with self.assertRaises(ValueError):
            validate_shift_color("yellow")


class ShiftsSerializerTestCase(TestCase):
    """
    Unit tests verifying serializer parsing and validation logic.
    """

    def test_serializer_success(self):
        payload = {
            "name": "Evening Shift",
            "time": "03:00 PM - 11:00 PM",
            "icon": "sunset",
            "color": "orange"
        }
        serializer = ShiftsSerializer(data=payload)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_serializer_name_uniqueness(self):
        # Create an existing shift
        Shifts.objects.create(
            id="SHF-01",
            name="Morning Shift",
            time="07:00 AM - 03:00 PM",
            icon="sun",
            color="blue"
        )
        
        # Duplicate name payload
        payload = {
            "name": "Morning Shift",
            "time": "09:00 AM - 05:00 PM",
            "icon": "briefcase",
            "color": "purple"
        }
        serializer = ShiftsSerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn("name", serializer.errors)


class ShiftsAPITestCase(TestCase):
    """
    Integration tests verifying Shifts API views, HTTP endpoints, and JWT authentication security.
    """

    def setUp(self):
        # 1. Create a super admin user
        self.super_admin = SuperAdmin.objects.create(
            name="Test Super Admin",
            email="admin@hms.com",
            role="super_admin",
            is_active=True
        )
        self.super_admin.set_password("secure123")
        self.super_admin.save()

        # 2. Generate JWT token
        token_payload = {
            "user_id": self.super_admin.id,
            "email": self.super_admin.email,
            "role": self.super_admin.role
        }
        self.token = JWTService.generate_token(token_payload)
        self.auth_headers = {"HTTP_AUTHORIZATION": f"Bearer {self.token}"}

        # 3. Create a non-super admin user for permissions testing
        self.staff_user = SuperAdmin.objects.create(
            name="Staff User",
            email="staff@hms.com",
            role="front_desk",  # NOT a superadmin role
            is_active=True
        )
        self.staff_token = JWTService.generate_token({
            "user_id": self.staff_user.id,
            "email": self.staff_user.email,
            "role": self.staff_user.role
        })
        self.staff_headers = {"HTTP_AUTHORIZATION": f"Bearer {self.staff_token}"}

        # 4. Define URLs
        self.list_create_url = reverse('shift_list_create')

    def test_unauthorized_access_blocks_all_methods(self):
        # GET list without token -> 401
        response = self.client.get(self.list_create_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

        # POST create without token -> 401
        response = self.client.post(self.list_create_url, data={})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_non_superadmin_forbidden(self):
        # GET list with staff token -> 403 Forbidden
        response = self.client.get(self.list_create_url, **self.staff_headers)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

        # POST create with staff token -> 403 Forbidden
        response = self.client.post(self.list_create_url, data={}, **self.staff_headers)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_superadmin_create_and_list_shifts(self):
        # Initial shifts count
        self.assertEqual(Shifts.objects.count(), 0)

        # POST valid shift -> 201 Created
        payload = {
            "name": "Morning Shift",
            "time": "07:00 AM - 03:00 PM",
            "icon": "sun",
            "color": "blue"
        }
        response = self.client.post(self.list_create_url, data=payload, content_type='application/json', **self.auth_headers)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.json()['data']['id'], 'SHF-01')
        self.assertEqual(response.json()['data']['name'], 'Morning Shift')

        # GET shifts list -> 200 OK
        response = self.client.get(self.list_create_url, **self.auth_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify structure containing both 'shifts' list and 'stats' dictionary
        data_res = response.json()['data']
        self.assertIn('shifts', data_res)
        self.assertIn('stats', data_res)
        self.assertEqual(len(data_res['shifts']), 1)
        self.assertEqual(data_res['shifts'][0]['id'], 'SHF-01')
        self.assertEqual(data_res['stats']['totalShifts'], 1)

    def test_shift_detail_update_delete(self):
        # Create a shift directly
        shift = Shifts.objects.create(
            id="SHF-01",
            name="Morning Shift",
            time="07:00 AM - 03:00 PM",
            icon="sun",
            color="blue"
        )
        detail_url = reverse('shift_detail_update_delete', kwargs={'shift_id': shift.id})

        # PUT modify shift -> 200 OK
        update_payload = {
            "name": "Modified Morning Shift",
            "time": "08:00 AM - 04:00 PM",
            "color": "emerald"
        }
        response = self.client.put(detail_url, data=update_payload, content_type='application/json', **self.auth_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.json()['data']['name'], 'Modified Morning Shift')
        self.assertEqual(response.json()['data']['time'], '08:00 AM - 04:00 PM')
        self.assertEqual(response.json()['data']['color'], 'emerald')
        self.assertEqual(response.json()['data']['icon'], 'sun')  # unchanged

        # DELETE shift -> 200 OK
        response = self.client.delete(detail_url, **self.auth_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(Shifts.objects.count(), 0)
