import re

ALLOWED_COLORS = {'purple', 'blue', 'orange', 'indigo', 'rose', 'emerald', 'slate'}
ALLOWED_ICONS = {'clock', 'sun', 'sunset', 'moon', 'briefcase'}

def validate_shift_name(name: str) -> None:
    """
    Validates that the shift name is not empty, is within character limits,
    and consists of valid characters.
    """
    if not name or not isinstance(name, str):
        raise ValueError("Shift name must be a non-empty string.")
    
    name_clean = name.strip()
    if len(name_clean) < 3:
        raise ValueError("Shift name must be at least 3 characters long.")
    if len(name_clean) > 150:
        raise ValueError("Shift name cannot exceed 150 characters.")
    
    # Allow alphanumeric characters, spaces, and hyphens/underscores
    if not re.match(r'^[a-zA-Z0-9\s\-_]+$', name_clean):
        raise ValueError("Shift name contains invalid characters. Only letters, numbers, spaces, hyphens, and underscores are allowed.")

def validate_shift_time(time_str: str) -> None:
    """
    Validates the shift time range format: 'HH:MM AM/PM - HH:MM AM/PM'
    Example: '07:00 AM - 03:00 PM'
    """
    if not time_str or not isinstance(time_str, str):
        raise ValueError("Shift time range is required.")
    
    time_clean = time_str.strip()
    pattern = r'^\d{2}:\d{2} [AP]M - \d{2}:\d{2} [AP]M$'
    if not re.match(pattern, time_clean):
        raise ValueError("Shift time must be in 'HH:MM AM/PM - HH:MM AM/PM' format (e.g., '07:00 AM - 03:00 PM').")
    
    try:
        start_str, end_str = time_clean.split(' - ')
        
        def parse_time_parts(t_str):
            time_part, modifier = t_str.split(' ')
            hours, minutes = map(int, time_part.split(':'))
            if hours < 1 or hours > 12:
                raise ValueError("Hour must be between 01 and 12.")
            if minutes < 0 or minutes > 59:
                raise ValueError("Minute must be between 00 and 59.")
            return hours, minutes, modifier

        parse_time_parts(start_str)
        parse_time_parts(end_str)
    except Exception as e:
        raise ValueError(f"Invalid time values in shift schedule: {str(e)}")

def validate_shift_icon(icon: str) -> None:
    """
    Validates that the icon matches one of the expected Lucide icon mapped strings.
    """
    if not icon or not isinstance(icon, str):
        raise ValueError("Shift icon is required.")
    
    icon_clean = icon.strip().lower()
    if icon_clean not in ALLOWED_ICONS:
        raise ValueError(f"Shift icon must be one of: {', '.join(ALLOWED_ICONS)}")

def validate_shift_color(color: str) -> None:
    """
    Validates that the color matches one of the expected CSS theme accent variables.
    """
    if not color or not isinstance(color, str):
        raise ValueError("Shift color is required.")
    
    color_clean = color.strip().lower()
    if color_clean not in ALLOWED_COLORS:
        raise ValueError(f"Shift color must be one of: {', '.join(ALLOWED_COLORS)}")
