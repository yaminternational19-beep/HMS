from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from apps.authentication.models import SuperAdmin
from apps.superadmin.staff.models import Staff
from apps.superadmin.shifts.models import Shifts
from apps.superadmin.staff.services import StaffService
from apps.authentication.services import StaffAuthService, SuperAdminAuthService

class AuthAPITestCase(TestCase):
    """
    Test suite for superadmin and employee authentication APIs.
    """

    def setUp(self):
        # Clear database
        SuperAdmin.objects.all().delete()
        Staff.objects.all().delete()
        Shifts.objects.all().delete()

        # 1. Create a Super Admin
        self.superadmin = SuperAdmin(
            id="SAD-01",
            name="Admin User",
            email="admin@blackcube.ae"
        )
        self.superadmin.set_password("admin123")
        self.superadmin.save()

        # 2. Provision Shifts
        self.shift_admin = Shifts.objects.create(
            id="SHF-04",
            name="Administration Shift",
            time="09:00 AM - 05:00 PM",
            icon="briefcase",
            color="blue"
        )
        self.shift_front = Shifts.objects.create(
            id="SHF-01",
            name="Morning Shift",
            time="07:00 AM - 03:00 PM",
            icon="sun",
            color="emerald"
        )

        # 3. Seed initial staff (will hash passwords using make_password internally)
        StaffService.seed_initial_staff()

        # Override shift times to cover 24 hours to ensure test cases always pass regardless of the execution hour
        for shift in Shifts.objects.all():
            shift.time = "12:00 AM - 11:59 PM"
            shift.save()

    def test_superadmin_login_success(self):
        url = reverse('superadmin_login')
        payload = {
            "email": "admin@blackcube.ae",
            "password": "admin123"
        }
        response = self.client.post(url, data=payload, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data["data"])
        self.assertEqual(response.data["data"]["profile"]["email"], "admin@blackcube.ae")

    def test_superadmin_login_bad_password(self):
        url = reverse('superadmin_login')
        payload = {
            "email": "admin@blackcube.ae",
            "password": "wrongpassword"
        }
        response = self.client.post(url, data=payload, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_staff_login_success_by_id(self):
        url = reverse('staff_login')
        # Sarah Connor (Front Desk Manager, ID STF-02, password SarahHMS2026)
        payload = {
            "staffCode": "STF-02",
            "password": "SarahHMS2026"
        }
        response = self.client.post(url, data=payload, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data["data"])
        self.assertEqual(response.data["data"]["profile"]["name"], "Sarah Connor")

    def test_staff_login_success_by_unique_code(self):
        url = reverse('staff_login')
        # Sarah Connor uniqueCode is 29384756
        payload = {
            "staffCode": "29384756",
            "password": "SarahHMS2026"
        }
        response = self.client.post(url, data=payload, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn("token", response.data["data"])
        self.assertEqual(response.data["data"]["profile"]["name"], "Sarah Connor")

    def test_staff_login_denied_for_non_operational_role(self):
        url = reverse('staff_login')
        # Praveen Reddy is "Corporate Director" (non-operational role) and has no password configured.
        payload = {
            "staffCode": "STF-01",
            "password": "anypassword"
        }
        response = self.client.post(url, data=payload, content_type='application/json')
        # Should return unauthorized/forbidden access because of role restriction
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Only Front Office and Maintenance", response.data["message"])

    def test_staff_login_denied_outside_shift_window(self):
        from zoneinfo import ZoneInfo
        from datetime import datetime, timedelta
        
        ist_tz = ZoneInfo('Asia/Kolkata')
        now_ist = datetime.now(ist_tz)
        
        # Define a past, inactive shift window
        start_time_str = (now_ist - timedelta(hours=5)).strftime("%I:%M %p")
        end_time_str = (now_ist - timedelta(hours=4)).strftime("%I:%M %p")
        
        inactive_shift = Shifts.objects.create(
            id="SHF-TEST-INACTIVE",
            name="Inactive Shift",
            time=f"{start_time_str} - {end_time_str}",
            icon="clock",
            color="red"
        )
        
        sarah = Staff.objects.get(id="STF-02")
        sarah.shift = inactive_shift
        sarah.save()
        
        url = reverse('staff_login')
        payload = {
            "staffCode": "STF-02",
            "password": "SarahHMS2026"
        }
        response = self.client.post(url, data=payload, content_type='application/json')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        self.assertIn("Login denied", response.data["message"])
