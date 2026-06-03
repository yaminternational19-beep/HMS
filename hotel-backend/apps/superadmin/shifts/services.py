from zoneinfo import ZoneInfo
from django.db.models import Q
from .models import Shifts

class ShiftService:
    """
    Service Layer isolating database business logic and transaction orchestration
    for Shifts CRUD, returning clean React-compatible serializations and dynamic statistics.
    """

    @staticmethod
    def serialize_shift(shift: Shifts) -> dict:
        """
        Translates database Shifts model to custom dictionary mapping
        to match React camelCase parameters natively.
        """
        if not shift:
            return {}
        
        ist_tz = ZoneInfo('Asia/Kolkata')
        created_at_ist = shift.created_at.astimezone(ist_tz) if shift.created_at else None
        updated_at_ist = shift.updated_at.astimezone(ist_tz) if shift.updated_at else None

        return {
            "id": shift.id,
            "name": shift.name,
            "time": shift.time,
            "icon": shift.icon,
            "color": shift.color,
            "created_at": created_at_ist.isoformat() if created_at_ist else None,
            "updated_at": updated_at_ist.isoformat() if updated_at_ist else None
        }

    @classmethod
    def get_all_shifts(cls, filters: dict = None) -> dict:
        """
        Queries shifts from DB, computes coverage statistics dynamically based on active DB shifts,
        and returns the consolidated data dictionary containing both shifts list and stats.
        """
        queryset = Shifts.objects.all().order_by('id')
        
        if filters:
            search = filters.get('search')
            if search:
                queryset = queryset.filter(
                    Q(name__icontains=search) | Q(time__icontains=search)
                )
                
        shifts_list = [cls.serialize_shift(shift) for shift in queryset]

        # Calculate coverage statistics dynamically based on active DB shifts
        total_shifts = len(shifts_list)
        total_scheduled = 0
        morning_coverage = 0
        night_coverage = 0

        # Dynamically assign coverage estimates based on shift metadata for visual stats
        for s in shifts_list:
            name_lower = s["name"].lower()
            icon_lower = s["icon"].lower()
            if 'morning' in name_lower or icon_lower == 'sun':
                morning_coverage += 2
                total_scheduled += 2
            elif 'night' in name_lower or icon_lower == 'moon':
                night_coverage += 1
                total_scheduled += 1
            else:
                total_scheduled += 1

        stats = {
            "totalShifts": total_shifts,
            "totalScheduled": total_scheduled,
            "morningCoverage": morning_coverage,
            "nightCoverage": night_coverage
        }

        return {
            "shifts": shifts_list,
            "stats": stats
        }

    @classmethod
    def get_shift_by_id(cls, shift_id: str) -> dict:
        """
        Fetches a single shift by its unique formatted ID.
        """
        try:
            shift = Shifts.objects.get(id=shift_id.strip())
            return cls.serialize_shift(shift)
        except Shifts.DoesNotExist:
            return None

    @classmethod
    def generate_next_shift_id(cls) -> str:
        """
        Generates the next sequential Shift ID in the custom format SHF-XX.
        Example: SHF-01 -> SHF-02 -> SHF-03.
        """
        last_shift = Shifts.objects.all().order_by('-id').first()
        if not last_shift:
            return 'SHF-01'
        
        last_id = last_shift.id
        try:
            parts = last_id.split('-')
            if len(parts) == 2 and parts[1].isdigit():
                next_num = int(parts[1]) + 1
                return f"SHF-{next_num:02d}"
        except Exception:
            pass
        
        import uuid
        return f"SHF-{uuid.uuid4().hex[:6].upper()}"

    @classmethod
    def create_shift(cls, data: dict) -> dict:
        """
        Creates and persists a new Shift record with computed sequential ID.
        """
        name = data.get('name', '').strip()
        time_val = data.get('time', '').strip()
        icon = data.get('icon', 'clock').strip().lower()
        color = data.get('color', 'purple').strip().lower()

        if Shifts.objects.filter(name__iexact=name).exists():
            raise ValueError(f"Shift with name '{name}' already exists.")

        shift_id = cls.generate_next_shift_id()

        shift = Shifts(
            id=shift_id,
            name=name,
            time=time_val,
            icon=icon,
            color=color
        )
        shift.save()
        return cls.serialize_shift(shift)

    @classmethod
    def update_shift(cls, shift_id: str, data: dict) -> dict:
        """
        Modifies and saves an existing shift record in partial mode.
        """
        try:
            shift = Shifts.objects.get(id=shift_id.strip())
        except Shifts.DoesNotExist:
            return None

        if 'name' in data:
            name_val = data['name'].strip()
            if Shifts.objects.filter(name__iexact=name_val).exclude(id=shift_id).exists():
                raise ValueError(f"Shift with name '{name_val}' already exists.")
            shift.name = name_val
        
        if 'time' in data:
            shift.time = data['time'].strip()
        if 'icon' in data:
            shift.icon = data['icon'].strip().lower()
        if 'color' in data:
            shift.color = data['color'].strip().lower()

        shift.save()
        return cls.serialize_shift(shift)

    @classmethod
    def delete_shift(cls, shift_id: str) -> bool:
        """
        Deletes a shift record by its unique ID.
        """
        try:
            shift = Shifts.objects.get(id=shift_id.strip())
            shift.delete()
            return True
        except Shifts.DoesNotExist:
            return False
