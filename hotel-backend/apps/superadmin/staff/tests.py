from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from apps.authentication.models import SuperAdmin
from core.services.jwt_service import JWTService
from apps.superadmin.shifts.models import Shifts
from .models import Staff
from .validators import StaffValidator
from .serializers import StaffSerializer
from .services import StaffService


class StaffModelAndValidationTestCase(TestCase):
    """
    Unit tests covering the Staff database models, sequential ID/Code generation,
    and business logic validators (e.g. Operational Password rules).
    """

    def setUp(self):
        # Create standard Shifts required for foreign key relationships
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

    def test_validators_non_operational_role(self):
        # Operational password NOT required for Corporate Director
        data = {
            "name": "Alex Carter",
            "dept": "Corporate Director",
            "phoneNo": "50 111 2222",
            "emergencyNo": "50 333 4444",
            "shift_id": "SHF-04",
            "address": "Dubai, UAE",
            "govtProofId": "P992019"
        }
        try:
            validated = StaffValidator.validate_onboard_data(data)
            self.assertEqual(validated["name"], "Alex Carter")
        except Exception as e:
            self.fail(f"Validator failed unexpectedly: {e}")

    def test_validators_operational_role_requires_password(self):
        # Front Desk Manager requires an HMS password
        data = {
            "name": "Sarah Connor",
            "dept": "Front Desk Manager",
            "phoneNo": "50 111 2222",
            "emergencyNo": "50 333 4444",
            "shift_id": "SHF-01",
            "address": "Dubai, UAE",
            "govtProofId": "P992019"
        }
        from rest_framework.exceptions import ValidationError
        with self.assertRaises(ValidationError) as context:
            StaffValidator.validate_onboard_data(data)
        
        self.assertIn("password", context.exception.detail)

    def test_validators_email_format(self):
        # Bad email format
        data = {
            "name": "Alex Carter",
            "dept": "Corporate Director",
            "email": "bad_email_format",
            "phoneNo": "50 111 2222",
            "emergencyNo": "50 333 4444",
            "shift_id": "SHF-04",
            "address": "Dubai, UAE",
            "govtProofId": "P992019"
        }
        from rest_framework.exceptions import ValidationError
        with self.assertRaises(ValidationError) as context:
            StaffValidator.validate_onboard_data(data)
        
        self.assertIn("email", context.exception.detail)

    def test_validators_non_operational_role_cannot_have_password(self):
        # Corporate Director is non-operational and cannot have a password
        data = {
            "name": "Alex Carter",
            "dept": "Corporate Director",
            "password": "SecurePassword123",
            "phoneNo": "50 111 2222",
            "emergencyNo": "50 333 4444",
            "shift_id": "SHF-04",
            "address": "Dubai, UAE",
            "govtProofId": "P992019"
        }
        from rest_framework.exceptions import ValidationError
        with self.assertRaises(ValidationError) as context:
            StaffValidator.validate_onboard_data(data)
        
        self.assertIn("password", context.exception.detail)

    def test_service_sequential_id_generator(self):
        # First staff should be STF-01
        self.assertEqual(StaffService.generate_next_staff_id(), 'STF-01')
        
        # Save a staff member
        Staff.objects.create(
            id="STF-01",
            uniqueCode="11223344",
            name="Praveen Reddy",
            dept="Corporate Director",
            phoneCountry="+971",
            phoneNo="50 123 4567",
            emergencyCountry="+971",
            emergencyNo="50 999 1111",
            shift=self.shift_admin,
            status="active",
            address="Dubai"
        )
        # Next staff should be STF-02
        self.assertEqual(StaffService.generate_next_staff_id(), 'STF-02')


class StaffAPITestCase(TestCase):
    """
    Integration tests covering guarded CRUD API views under /api/staff/.
    """

    def setUp(self):
        # Ensure database is clean of staff
        Staff.objects.all().delete()
        Shifts.objects.all().delete()
        
        # 1. Provision a Super Admin user
        self.superadmin = SuperAdmin.objects.create(
            id="SAD-99",
            name="Primary Super Admin",
            email="admin@hms.com",
            password="hashed_secure_admin_pass"
        )
        
        # 2. Issue a JWT Token
        self.token = JWTService.generate_token(payload={
            "user_id": self.superadmin.id,
            "role": "superadmin"
        })
        self.headers = {
            "HTTP_AUTHORIZATION": f"Bearer {self.token}"
        }

        # 3. Trigger seeding
        StaffService.seed_initial_staff()
        self.assertEqual(Staff.objects.count(), 6)

    def test_get_staff_list_authenticated(self):
        url = reverse('staff_list_create')
        response = self.client.get(url, **self.headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Staff directory fetched successfully")
        self.assertEqual(len(response.data["data"]["staff"]), 6)
        # Assert stats are returned
        self.assertIn("stats", response.data["data"])
        self.assertEqual(response.data["data"]["stats"]["total"], 6)

    def test_get_staff_list_unauthorized(self):
        url = reverse('staff_list_create')
        # Empty auth headers
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_get_staff_search_filtering(self):
        url = reverse('staff_list_create')
        
        # Search by Name
        response = self.client.get(f"{url}?search=Praveen", **self.headers)
        self.assertEqual(len(response.data["data"]["staff"]), 1)
        self.assertEqual(response.data["data"]["staff"][0]["name"], "Praveen Reddy")
        
        # Search by 8-Digit unique code
        response = self.client.get(f"{url}?search=29384756", **self.headers)
        self.assertEqual(len(response.data["data"]["staff"]), 1)
        self.assertEqual(response.data["data"]["staff"][0]["name"], "Sarah Connor")
        
        # Filter by Dept / Role
        response = self.client.get(f"{url}?dept=Front Desk Manager", **self.headers)
        self.assertEqual(len(response.data["data"]["staff"]), 1)
        self.assertEqual(response.data["data"]["staff"][0]["name"], "Sarah Connor")

    def test_create_staff_agent(self):
        url = reverse('staff_list_create')
        payload = {
            "name": "Clarissa Jenkins",
            "dept": "Concierge Clerk",
            "password": "SecureConcierge123",
            "email": "clarissa.j@hms.com",
            "phoneCountry": "+971",
            "phoneNo": "50 555 6666",
            "emergencyCountry": "+971",
            "emergencyNo": "50 555 7777",
            "shiftId": "SHF-02",
            "status": "active",
            "address": "Flat 30, Marina Vista, Dubai",
            "govtProofType": "Passport",
            "govtProofId": "P99887712"
        }
        
        # Onboard a new member
        response = self.client.post(url, data=payload, content_type='application/json', **self.headers)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(response.data["message"], "Staff agent successfully onboarded!")
        
        # Verify STF-07 sequential key generation and uniqueCode generation
        new_staff = response.data["data"]
        self.assertEqual(new_staff["id"], "STF-07")
        self.assertEqual(len(new_staff["uniqueCode"]), 8)
        self.assertTrue(new_staff["uniqueCode"].isdigit())

    def test_update_staff_agent(self):
        url = reverse('staff_detail_update_delete', kwargs={'staff_id': 'STF-02'})
        payload = {
            "name": "Sarah Connor Upgraded",
            "status": "on-leave"
        }
        
        response = self.client.put(url, data=payload, content_type='application/json', **self.headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["data"]["name"], "Sarah Connor Upgraded")
        self.assertEqual(response.data["data"]["status"], "on-leave")

    def test_delete_staff_agent(self):
        url = reverse('staff_detail_update_delete', kwargs={'staff_id': 'STF-06'})
        
        response = self.client.delete(url, **self.headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data["message"], "Staff member successfully retired and deleted.")
        
        # Verify deletion from DB
        self.assertFalse(Staff.objects.filter(id="STF-06").exists())
