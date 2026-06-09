from apps.superadmin.rooms.models import Rooms

# The valid frontend status values that can be updated in frontoffice
ALLOWED_STATUSES = {
    'Available',
    'Occupied',
    'Reserved',
    'Under Maintenance',
    'Needs Cleaning'
}

def validate_room_status_update(room_number: str, new_status: str) -> Rooms:
    """
    Validates room status updates for the frontoffice rooms application.
    Checks:
    1. If the room number is provided and the room exists in the inventory.
    2. If the status value is provided and corresponds to a valid frontend status.
    Returns the Rooms instance if valid, or raises a ValueError.
    """
    if not room_number or not room_number.strip():
        raise ValueError("Room number is required.")

    if not new_status or not new_status.strip():
        raise ValueError("Room status is required.")

    # Frontoffice statuses should match ALLOWED_STATUSES (case-insensitive check for robustness)
    valid_lower = {s.lower() for s in ALLOWED_STATUSES}
    if new_status.strip().lower() not in valid_lower:
        allowed_str = ", ".join(sorted(list(ALLOWED_STATUSES)))
        raise ValueError(
            f"Invalid room status '{new_status}'. "
            f"Allowed values are: {allowed_str}."
        )

    try:
        room = Rooms.objects.get(room_number=room_number.strip())
    except Rooms.DoesNotExist:
        raise ValueError(f"Room {room_number} does not exist.")

    return room
