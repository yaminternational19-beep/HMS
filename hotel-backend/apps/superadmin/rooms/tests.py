from django.test import TestCase
from rest_framework.exceptions import ValidationError
from .validator import validate_floor_and_room_number
from .serializers import RoomsSerializer

class RoomValidatorTestCase(TestCase):
    """
    Unit tests for the room validator function and payload serializer behavior.
    """

    def test_floor_room_number_alignment_success(self):
        # Valid matching combinations
        try:
            validate_floor_and_room_number("1st Floor", "101")
            validate_floor_and_room_number("1st Floor", "102")
            validate_floor_and_room_number("1st Floor", "1")
            validate_floor_and_room_number("2nd Floor", "201")
            validate_floor_and_room_number("2nd Floor", "2")
            validate_floor_and_room_number("12th Floor", "1205")
            validate_floor_and_room_number("Ground Floor", "G01")  # ground floor has no digits, should be skipped
            validate_floor_and_room_number("Basement", "B01")      # no digits in floor, skipped
        except ValueError as ve:
            self.fail(f"validate_floor_and_room_number failed unexpectedly: {ve}")

    def test_floor_room_number_alignment_mismatch(self):
        # Mismatched combinations should raise ValueError
        with self.assertRaises(ValueError) as context:
            validate_floor_and_room_number("2nd Floor", "101")
        self.assertIn("Floor and Room Number mismatch", str(context.exception))

        with self.assertRaises(ValueError) as context:
            validate_floor_and_room_number("1st Floor", "205")
        self.assertIn("Floor and Room Number mismatch", str(context.exception))

        with self.assertRaises(ValueError) as context:
            validate_floor_and_room_number("3rd Floor", "1")
        self.assertIn("Floor and Room Number mismatch", str(context.exception))

    def test_serializer_payload_validation_success(self):
        # Valid full payload
        payload = {
            "roomNumber": "101",
            "floor": "1st Floor",
            "type": "Classic Queen",
            "bedType": "Queen",
            "price": 3500.0,
            "capacity": 2,
            "amenities": ["WiFi", "AC"],
            "description": "Clean cozy room",
            "status": "available"
        }
        serializer = RoomsSerializer(data=payload)
        self.assertTrue(serializer.is_valid(), serializer.errors)

    def test_serializer_payload_validation_invalid_price_and_capacity(self):
        # Invalid negative price
        payload = {
            "roomNumber": "101",
            "floor": "1st Floor",
            "type": "Classic Queen",
            "bedType": "Queen",
            "price": -100.0,  # invalid
            "capacity": 2
        }
        serializer = RoomsSerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn("price", serializer.errors)

        # Invalid capacity
        payload = {
            "roomNumber": "101",
            "floor": "1st Floor",
            "type": "Classic Queen",
            "bedType": "Queen",
            "price": 3500.0,
            "capacity": 0  # invalid
        }
        serializer = RoomsSerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn("capacity", serializer.errors)

    def test_serializer_payload_validation_floor_room_mismatch(self):
        # Room 201 on 1st Floor should be rejected by serializer validation
        payload = {
            "roomNumber": "201",
            "floor": "1st Floor",  # mismatch
            "type": "Classic Queen",
            "bedType": "Queen",
            "price": 3500.0,
            "capacity": 2
        }
        serializer = RoomsSerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn("roomNumber", serializer.errors)
        self.assertIn("Floor and Room Number mismatch", str(serializer.errors["roomNumber"][0]))

    def test_images_limit_validation(self):
        # Test validator function directly
        from .validator import validate_images_limit
        
        # 3 images -> OK
        try:
            validate_images_limit(["img1.png", "img2.png", "img3.png"])
        except ValueError:
            self.fail("validate_images_limit failed unexpectedly with less than 5 images.")
            
        # 6 images -> Expect ValueError
        with self.assertRaises(ValueError) as context:
            validate_images_limit(["1.png", "2.png", "3.png", "4.png", "5.png", "6.png"])
        self.assertIn("A maximum of 5 images are allowed", str(context.exception))

    def test_serializer_images_limit_validation_mismatch(self):
        # 6 images in serializer payload -> should raise ValidationError
        payload = {
            "roomNumber": "101",
            "floor": "1st Floor",
            "type": "Classic Queen",
            "bedType": "Queen",
            "price": 3500.0,
            "capacity": 2,
            "images": ["1.jpg", "2.jpg", "3.jpg", "4.jpg", "5.jpg", "6.jpg"]
        }
        serializer = RoomsSerializer(data=payload)
        self.assertFalse(serializer.is_valid())
        self.assertIn("images", serializer.errors)
        self.assertIn("A maximum of 5 images are allowed", str(serializer.errors["images"][0]))

