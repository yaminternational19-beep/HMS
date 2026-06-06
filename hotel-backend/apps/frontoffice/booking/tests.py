from django.test import TestCase
from django.utils import timezone
from datetime import datetime, timedelta
from decimal import Decimal
from .validator import validate_booking_dates, validate_room_availability
from .serializers import BookingSerializer
from .models import Booking, BookingPayment, BookingTransaction, BookingGuest, BookingDocument
from apps.superadmin.rooms.models import Rooms
from apps.superadmin.staff.models import Staff

class BookingValidatorTestCase(TestCase):
    """
    Test cases for custom booking validations.
    """
    def test_check_out_before_check_in_fails(self):
        check_in = timezone.now()
        check_out = check_in - timedelta(hours=2)
        with self.assertRaises(ValueError) as context:
            validate_booking_dates(check_in, check_out)
        self.assertIn("Check-out date/time must be strictly after the check-in date/time", str(context.exception))

    def test_equal_check_in_and_check_out_fails(self):
        check_in = timezone.now()
        with self.assertRaises(ValueError) as context:
            validate_booking_dates(check_in, check_in)
        self.assertIn("Check-out date/time must be strictly after the check-in date/time", str(context.exception))

    def test_valid_dates_pass(self):
        check_in = timezone.now()
        check_out = check_in + timedelta(days=2)
        # Should run without raising any exceptions
        validate_booking_dates(check_in, check_out)


class BookingSerializerTestCase(TestCase):
    """
    Test cases for DRF serialization & deserialization fields mapping.
    """
    def setUp(self):
        self.booking_data = {
            "guestName": "John Smith",
            "phone": "+91 99999 88888",
            "roomNumber": "202",
            "roomType": "Deluxe",
            "checkIn": "2026-06-10T12:00:00Z",
            "checkOut": "2026-06-15T11:00:00Z",
            "paymentStatus": "Paid",
            "totalGuests": 2,
            "amount": 16000.0,
            "rawData": {"bookingDetails": {"nights": 5}}
        }

    def test_serializer_validation_success(self):
        serializer = BookingSerializer(data=self.booking_data)
        self.assertTrue(serializer.is_valid(), serializer.errors)
        validated_data = serializer.validated_data
        
        # Check mapping
        self.assertEqual(validated_data['guest_name'], "John Smith")
        self.assertEqual(validated_data['phone'], "+91 99999 88888")
        self.assertEqual(validated_data['room_snapshot_number'], "202")
        self.assertEqual(validated_data['room_snapshot_type'], "Deluxe")
        self.assertEqual(validated_data['total_guests'], 2)
        self.assertEqual(validated_data['raw_data']['bookingDetails']['nights'], 5)

    def test_serializer_invalid_date_fails(self):
        bad_data = self.booking_data.copy()
        bad_data['checkIn'] = "2026-06-20T12:00:00Z"
        bad_data['checkOut'] = "2026-06-15T11:00:00Z"
        
        serializer = BookingSerializer(data=bad_data)
        self.assertFalse(serializer.is_valid())
        self.assertIn('checkIn', serializer.errors)


class BookingServiceIntegrationTestCase(TestCase):
    """
    Integration test cases to verify business logic and table population.
    """
    def setUp(self):
        # Create a dummy Room to associate
        self.room = Rooms.objects.create(
            room_number="303",
            floor="3rd Floor",
            room_type="Suite",
            bed_type="King",
            capacity=2,
            price=5000.0,
            status="available"
        )
        
        self.staff_member = Staff.objects.create(
            first_name="Jane",
            last_name="Manager",
            status="active",
            role="front_office_staff"
        )

        self.payload = {
            "guest_name": "Rohan Patel",
            "phone": "+91 98765 43210",
            "room_snapshot_number": "303",
            "room_snapshot_type": "Suite",
            "check_in": timezone.now() + timedelta(days=1),
            "check_out": timezone.now() + timedelta(days=3),
            "status": "Confirmed",
            "total_guests": 2,
            "amount": 10000.0,
            "raw_data": {
                "bookingDetails": {
                    "bookingSource": "Online",
                    "purposeOfVisit": "Leisure",
                    "adultsCount": 2,
                    "childrenCount": 0,
                },
                "primaryGuest": {
                    "guestName": "Rohan Patel",
                    "nationality": "Indian",
                    "email": "rohan@example.com",
                    "address1": "Flat 502",
                    "city": "Ahmedabad",
                    "state": "Gujarat",
                },
                "idProof": {
                    "idType": "Aadhaar",
                    "idNumber": "1111-2222-3333",
                    "verificationStatus": "Verified"
                },
                "paymentDetails": {
                    "roomRent": "5000.00",
                    "extraCharges": "0.00",
                    "discount": "0.00",
                    "gst": "0.00",
                    "advancePaid": "2000.00",
                    "finalAmount": "10000.00",
                    "paymentStatus": "Partial",
                    "paymentMethod": "UPI",
                    "transactionId": "UPI987654321"
                },
                "additionalGuests": [
                    {
                        "name": "Kavita Patel",
                        "gender": "Female",
                        "age": "28",
                        "relation": "Spouse",
                        "phone": "+91 98765 43211",
                        "idType": "PAN",
                        "idNumber": "ABCDE1234F"
                    }
                ]
            }
        }

    def test_booking_service_creates_records_successfully(self):
        from .services import BookingService
        
        # Create booking using Service
        booking_repr = BookingService.create_booking(self.payload, self.staff_member)
        self.assertIsNotNone(booking_repr)
        self.assertTrue(booking_repr['bookingCode'].startswith('BKG-'))
        
        # Verify Booking General Record
        booking = Booking.objects.get(booking_code=booking_repr['bookingCode'])
        self.assertEqual(booking.guest_name, "Rohan Patel")
        self.assertEqual(booking.booking_source, "Online")
        self.assertEqual(booking.purpose_of_visit, "Leisure")
        
        # Verify BookingPayment Financial Summary (Decimals check)
        payment = booking.payment_details
        self.assertEqual(payment.room_rent, Decimal('5000.00'))
        self.assertEqual(payment.advance_paid, Decimal('2000.00'))
        self.assertEqual(payment.final_amount, Decimal('10000.00'))
        self.assertEqual(payment.payment_status, "Partial")
        self.assertEqual(payment.payment_method, "UPI")
        
        # Verify BookingTransaction advance payment creation
        transactions = booking.transactions.all()
        self.assertEqual(transactions.count(), 1)
        self.assertEqual(transactions[0].transaction_type, "Advance")
        self.assertEqual(transactions[0].amount, Decimal('2000.00'))
        self.assertEqual(transactions[0].payment_method, "UPI")
        
        # Verify BookingGuests creation
        guests = booking.guests.all().order_by('-is_primary_guest')
        self.assertEqual(guests.count(), 2)
        
        # Primary guest
        self.assertEqual(guests[0].full_name, "Rohan Patel")
        self.assertTrue(guests[0].is_primary_guest)
        self.assertEqual(guests[0].id_number, "1111-2222-3333")
        
        # Additional guest
        self.assertEqual(guests[1].full_name, "Kavita Patel")
        self.assertFalse(guests[1].is_primary_guest)
        self.assertEqual(guests[1].relation, "Spouse")
