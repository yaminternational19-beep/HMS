import time
from django.test import TestCase
from django.urls import reverse
from rest_framework import status
from django.utils import timezone
from datetime import timedelta

from apps.authentication.models import SuperAdmin
from apps.superadmin.shifts.models import Shifts
from apps.superadmin.staff.models import Staff
from apps.superadmin.rooms.models import Rooms
from apps.frontoffice.booking.models import Booking
from core.services.jwt_service import JWTService


class FrontOfficeRoomsAPITestCase(TestCase):
    """
    Unit and Integration tests for Front Office Room Inventory APIs.
    """

    def setUp(self):
        # 1. Clean database tables
        Rooms.objects.all().delete()
        Booking.objects.all().delete()
        Staff.objects.all().delete()
        Shifts.objects.all().delete()
        SuperAdmin.objects.all().delete()

        # 2. Provision shifts for staff
        self.shift = Shifts.objects.create(
            id="SHF-10",
            name="Front Office Shift",
            time="07:00 AM - 03:00 PM",
            icon="sun",
            color="blue"
        )

        # 3. Provision a staff member
        self.staff_member = Staff.objects.create(
            id="STF-10",
            uniqueCode="87654321",
            name="John FrontDesk",
            dept="Front Office",
            phoneCountry="+91",
            phoneNo="9876543210",
            emergencyCountry="+91",
            emergencyNo="9876543211",
            shift=self.shift,
            status="active",
            address="Frontdesk Office"
        )

        # 4. Generate Staff Token
        staff_payload = {
            "employee_id": self.staff_member.id,
            "aud": "hotel-frontoffice",
            "iat": int(time.time())
        }
        self.staff_token = JWTService.generate_token(staff_payload)
        self.staff_headers = {"HTTP_AUTHORIZATION": f"Bearer {self.staff_token}"}

        # 5. Provision a Super Admin user
        self.superadmin = SuperAdmin.objects.create(
            id="SAD-10",
            name="Admin User",
            email="admin@hms.com",
            role="super_admin",
            is_active=True
        )
        self.superadmin.set_password("adminpassword")
        self.superadmin.save()

        # 6. Generate Super Admin Token
        admin_payload = {
            "user_id": self.superadmin.id,
            "email": self.superadmin.email,
            "role": self.superadmin.role,
            "aud": "hotel-admin"
        }
        self.admin_token = JWTService.generate_token(admin_payload)
        self.admin_headers = {"HTTP_AUTHORIZATION": f"Bearer {self.admin_token}"}

        # 7. Create Test Rooms
        self.room_avail = Rooms.objects.create(
            room_number="101",
            floor="1st Floor",
            room_type="Single",
            bed_type="Single",
            capacity=1,
            price=1500.0,
            status="available",
            amenities=["WiFi", "AC"],
            images=["/uploads/rooms/101.jpg"],
            description="Cozy single room",
            last_cleaned="1 hour ago"
        )

        self.room_occ = Rooms.objects.create(
            room_number="102",
            floor="1st Floor",
            room_type="Double",
            bed_type="Double",
            capacity=2,
            price=2500.0,
            status="occupied",
            amenities=["WiFi", "AC", "TV"],
            images=[],
            description="Cozy double room",
            last_cleaned="2 hours ago"
        )

        self.room_maint = Rooms.objects.create(
            room_number="201",
            floor="2nd Floor",
            room_type="Deluxe",
            bed_type="Queen",
            capacity=2,
            price=4000.0,
            status="maintenance",
            amenities=["WiFi", "AC", "Mini Bar"],
            images=[],
            description="Luxury deluxe room",
            last_cleaned="Yesterday"
        )

        # 8. Create an active Check-In Booking for Room 102 (for dynamic guest name testing)
        self.booking = Booking.objects.create(
            booking_code="BKG-001",
            guest_name="Alice Wonderland",
            phone="9998887776",
            room=self.room_occ,
            room_snapshot_number="102",
            room_snapshot_type="Double",
            check_in=timezone.now() - timedelta(days=1),
            check_out=timezone.now() + timedelta(days=2),
            status="Checked-In",
            total_guests=2,
            raw_data={"bookingDetails": {}}
        )

        # URLs
        self.list_url = reverse('room_list_stats')

    def test_unauthorized_access_blocks_get_list(self):
        # GET request without authentication token -> 401
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_staff_retrieve_rooms_list_and_stats(self):
        # GET request with staff authentication token -> 200
        response = self.client.get(self.list_url, **self.staff_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        body = response.json()
        self.assertEqual(body["message"], "Room list and stats retrieved successfully.")
        
        data = body["data"]
        self.assertIn("rooms", data)
        self.assertIn("stats", data)

        # Verify Rooms
        rooms = data["rooms"]
        self.assertEqual(len(rooms), 3)

        # Verify exact serialization mapping
        room_101 = next(r for r in rooms if r["roomNumber"] == "101")
        self.assertEqual(room_101["id"], "RM-101")
        self.assertEqual(room_101["status"], "Available")
        self.assertIn("http://localhost:8000/uploads/rooms/101.jpg", room_101["images"][0])
        self.assertIsNone(room_101["guestName"])

        # Verify dynamic guest name retrieval for check-in
        room_102 = next(r for r in rooms if r["roomNumber"] == "102")
        self.assertEqual(room_102["status"], "Occupied")
        self.assertEqual(room_102["guestName"], "Alice Wonderland")

        # Verify Stats
        stats_data = data["stats"]
        self.assertEqual(stats_data["total"], 3)
        self.assertEqual(stats_data["available"], 1)
        self.assertEqual(stats_data["occupied"], 1)
        self.assertEqual(stats_data["maintenance"], 1)

    def test_superadmin_allowed_to_get_list_stats(self):
        # GET request with admin authentication token -> 200
        response = self.client.get(self.list_url, **self.admin_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.json()["data"]["rooms"]), 3)

    def test_get_list_with_search_and_status_filtering(self):
        # Filter by status = 'Available'
        response = self.client.get(f"{self.list_url}?status=Available", **self.staff_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        rooms = response.json()["data"]["rooms"]
        self.assertEqual(len(rooms), 1)
        self.assertEqual(rooms[0]["roomNumber"], "101")

        # Stats should still return full database counts
        self.assertEqual(response.json()["data"]["stats"]["total"], 3)

        # Search filter (matches room number or guest name)
        response = self.client.get(f"{self.list_url}?search=Alice", **self.staff_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        rooms_search = response.json()["data"]["rooms"]
        self.assertEqual(len(rooms_search), 1)
        self.assertEqual(rooms_search[0]["roomNumber"], "102")

    def test_staff_update_room_status_success(self):
        detail_url = reverse('update_room_status', kwargs={'room_number': '101'})
        payload = {"status": "Under Maintenance"}

        # PUT request by staff member to update status -> 200
        response = self.client.put(detail_url, data=payload, content_type='application/json', **self.staff_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        # Verify response matches serialized room
        room_data = response.json()["data"]
        self.assertEqual(room_data["status"], "Under Maintenance")
        self.assertEqual(room_data["status_updated_by_role"], "staff")
        self.assertEqual(room_data["status_updated_by_id"], "STF-10")

        # Verify DB is updated
        updated_room = Rooms.objects.get(room_number="101")
        self.assertEqual(updated_room.status, "maintenance")

    def test_superadmin_forbidden_to_update_status(self):
        detail_url = reverse('update_room_status', kwargs={'room_number': '101'})
        payload = {"status": "Under Maintenance"}

        # PUT request by superadmin -> 403 Forbidden
        response = self.client.put(detail_url, data=payload, content_type='application/json', **self.admin_headers)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_update_status_with_missing_payload_fails(self):
        detail_url = reverse('update_room_status', kwargs={'room_number': '101'})
        
        # Empty payload -> 400 Bad Request
        response = self.client.put(detail_url, data={}, content_type='application/json', **self.staff_headers)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("status field is required", response.json()["message"])

    def test_update_status_with_invalid_status_fails(self):
        detail_url = reverse('update_room_status', kwargs={'room_number': '101'})
        payload = {"status": "invalid_status_value"}

        # Invalid status payload -> 400 Bad Request
        response = self.client.put(detail_url, data=payload, content_type='application/json', **self.staff_headers)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn("Invalid room status", response.json()["message"])

    def test_update_status_nonexistent_room_fails(self):
        detail_url = reverse('update_room_status', kwargs={'room_number': '999'})
        payload = {"status": "Available"}

        # Nonexistent room number -> 404 Not Found
        response = self.client.put(detail_url, data=payload, content_type='application/json', **self.staff_headers)
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        self.assertIn("does not exist", response.json()["message"])

    def test_available_rooms_endpoint_retrieves_only_available_status(self):
        url = reverse('available_rooms')
        
        # 1. GET request without token -> 401
        response = self.client.get(url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
        
        # 2. GET request with token -> 200
        response = self.client.get(url, **self.staff_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()["data"]
        rooms = data["rooms"]
        room_types = data["roomTypes"]
        
        # Room 101 is available. Room 102 is occupied. Room 201 is maintenance.
        self.assertEqual(len(rooms), 1)
        self.assertEqual(rooms[0]["roomNumber"], "101")
        self.assertEqual(room_types, ["Single"])
        
        # 3. GET request with include_room=102 -> returns 101 and 102
        response = self.client.get(f"{url}?include_room=102", **self.staff_headers)
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        
        data = response.json()["data"]
        rooms = data["rooms"]
        self.assertEqual(len(rooms), 2)
        room_numbers = [r["roomNumber"] for r in rooms]
        self.assertIn("101", room_numbers)
        self.assertIn("102", room_numbers)
        self.assertIn("Double", data["roomTypes"])
