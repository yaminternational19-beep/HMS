from django.utils import timezone
from apps.superadmin.rooms.models import Rooms
from .models import Booking

def validate_booking_dates(check_in, check_out):
    """
    Validates that both check-in and check-out exist, and check-in occurs before check-out.
    """
    if not check_in or not check_out:
        raise ValueError("Both check-in and check-out dates are required.")
        
    if check_in >= check_out:
        raise ValueError("Check-out date/time must be strictly after the check-in date/time.")

def validate_room_availability(room_number, check_in, check_out, exclude_booking_id=None):
    """
    Checks if the specified room is available (no conflicting active bookings)
    during the requested time range.
    """
    if not room_number:
        raise ValueError("Room number is required for booking.")

    # 1. Verify room exists
    try:
        room = Rooms.objects.get(room_number=room_number.strip())
    except Rooms.DoesNotExist:
        raise ValueError(f"Room '{room_number}' does not exist in the inventory.")

    # 2. Check for active (non-cancelled) bookings that overlap in time
    # Overlap logic: check_in_A < check_out_B and check_out_A > check_in_B
    overlapping = Booking.objects.filter(
        room_snapshot_number=room_number.strip(),
        check_in__lt=check_out,
        check_out__gt=check_in
    ).exclude(status='Cancelled')

    if exclude_booking_id:
        overlapping = overlapping.exclude(id=exclude_booking_id)

    if overlapping.exists():
        conflicting_booking = overlapping.first()
        raise ValueError(
            f"Room {room_number} is already occupied or reserved during this period "
            f"(Conflicting Booking: {conflicting_booking.booking_code})."
        )
    
    return room

def validate_guest_id_proof(id_type, id_number):
    """
    Validates that the government ID proof type is one of the allowed values
    and the ID number is provided.
    """
    ALLOWED_IDS = {'Aadhaar', 'PAN', 'Passport', 'Voter ID', 'Driving License'}
    if not id_type:
        raise ValueError("Government ID type is required.")
    if id_type not in ALLOWED_IDS:
        raise ValueError(f"Invalid ID type '{id_type}'. Allowed types are: {', '.join(sorted(list(ALLOWED_IDS)))}.")
    if not id_number or not id_number.strip():
        raise ValueError("Government ID number is required.")
