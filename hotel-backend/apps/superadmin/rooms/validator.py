import re

def validate_floor_and_room_number(floor: str, room_number: str) -> None:
    """
    Validates that the room number matches the designated floor level to avoid mismatches.
    Examples:
      - floor="1st Floor", room_number="101" -> OK
      - floor="2nd Floor", room_number="1" -> Mismatch (Room 1 belongs on 1st floor, 2nd floor room should start with 2)
      - floor="3rd Floor", room_number="302" -> OK
      - floor="4th Floor", room_number="304" -> Mismatch (Starts with 3 but floor is 4th)
      - floor="Ground Floor", room_number="G01" -> OK (no digit in floor, skips digit validation)
    """
    if not floor or not room_number:
        return

    floor = str(floor).strip()
    room_number = str(room_number).strip()

    # Find the numeric part in floor name (e.g. "1st Floor" -> "1", "12th Floor" -> "12")
    floor_match = re.search(r'\d+', floor)
    if not floor_match:
        # No digits in floor name, e.g. "Ground Floor", "Basement". Skip numeric checks.
        return

    floor_num = floor_match.group(0)

    # Find the numeric part in the room number (e.g. "101" -> "101", "A-202" -> "202")
    room_match = re.search(r'\d+', room_number)
    if not room_match:
        # No digits in room number, e.g. "Penthouse Room". Skip numeric checks.
        return

    room_num_str = room_match.group(0)

    # Check if the room number starts with the floor number
    if not room_num_str.startswith(floor_num):
        raise ValueError(
            f"Floor and Room Number mismatch: Room '{room_number}' does not belong on '{floor}'. "
            f"Expected a room number starting with '{floor_num}' (e.g., {floor_num}01 or {floor_num})."
        )

def validate_images_limit(images: list, files=None) -> None:
    """
    Validates that the total number of room images (both direct URLs and uploaded files)
    does not exceed the maximum allowed limit of 5.
    """
    uploaded_files_count = 0
    if files:
        uploaded_files_count = len(files.getlist('images'))
        
    url_images_count = 0
    if isinstance(images, list):
        url_images_count = len(images)
    elif isinstance(images, str) and images:
        url_images_count = 1
        
    total_images = uploaded_files_count + url_images_count
    if total_images > 5:
        raise ValueError(
            f"A maximum of 5 images are allowed per room. You provided/uploaded {total_images} images."
        )
