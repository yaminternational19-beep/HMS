import random
from django.db import transaction
from django.db.models import Q
from django.contrib.auth.hashers import make_password
from .models import Staff
from apps.superadmin.shifts.models import Shifts
from .validators import StaffValidator
from core.services.upload_service import UploadService

class StaffService:
    """
    Service Layer implementing business transactions, sequential ID routing,
    8-digit unique code allocation, dynamic search-matching, and mock seeding.
    """

    @classmethod
    def is_staff_on_duty(cls, member: Staff) -> bool:
        """
        Determines dynamically if a staff member is currently on duty today.
        A staff member is on duty if they have logged in since today's shift start time in IST.
        They are automatically logged out at the end of the day (midnight IST).
        """
        from zoneinfo import ZoneInfo
        from datetime import datetime, time, timedelta, timezone
        
        # 1. Get current time in Asia/Kolkata (IST)
        ist_tz = ZoneInfo('Asia/Kolkata')
        now_ist = datetime.now(ist_tz)
        today_ist = now_ist.date()
        
        # 2. Find shift start time
        start_time_obj = time(9, 0) # default fallback
        if member.shift and member.shift.time:
            try:
                # e.g., '07:00 AM - 03:00 PM' -> '07:00 AM'
                start_part = member.shift.time.split('-')[0].strip()
                start_time_obj = datetime.strptime(start_part, "%I:%M %p").time()
            except Exception:
                pass
        
        # 3. Construct today's shift start datetime in IST
        shift_start_ist = datetime.combine(today_ist, start_time_obj, tzinfo=ist_tz)
        midnight_ist = datetime.combine(today_ist, time(0, 0, 0), tzinfo=ist_tz)
        
        # We allow checking logs from max(midnight, shift_start - 60 mins buffer) to handle early checkins
        cutoff_ist = max(midnight_ist, shift_start_ist - timedelta(minutes=60))
        
        # Convert cutoff time to UTC to query the database
        cutoff_utc = cutoff_ist.astimezone(timezone.utc)
        
        # 4. Query the latest log since the cutoff
        from .models import StaffLog
        latest_log = StaffLog.objects.filter(
            staff=member, 
            timestamp__gte=cutoff_utc
        ).order_by('timestamp').last()
        
        if latest_log:
            return latest_log.action == 'login'
            
        return False

    @classmethod
    def serialize_staff(cls, member: Staff) -> dict:
        """
        Transforms a database Staff model record to a React-friendly dictionary format.
        """
        if not member:
            return {}

        from zoneinfo import ZoneInfo
        ist_tz = ZoneInfo('Asia/Kolkata')
        created_at_ist = member.created_at.astimezone(ist_tz) if member.created_at else None
        updated_at_ist = member.updated_at.astimezone(ist_tz) if member.updated_at else None

        return {
            "id": member.staff_code,
            "uniqueCode": member.unique_code,
            "name": member.name,
            "dept": member.dept,
            "role": member.dept,
            "password": member.password,
            "email": member.email or "",
            "phoneCountry": member.phone_country,
            "phoneNo": member.phone_no,
            "phone": f"{member.phone_country} {member.phone_no}",
            "emergencyCountry": member.emergency_country,
            "emergencyNo": member.emergency_no,
            "emergencyPhone": f"{member.emergency_country} {member.emergency_no}",
            "shiftId": member.shift.shift_code if member.shift else '',
            "status": member.status,
            "isCheckedIn": cls.is_staff_on_duty(member),
            "address": member.address,
            "govtProofType": member.govt_proof_type,
            "govtProofId": member.govt_proof_id,
            "govtProofFileName": member.govt_proof_file_name or "",
            "govtProofFileUrl": member.govt_proof_file_url or "",
            "profileFileName": member.profile_file_name or "",
            "profileFileUrl": member.profile_file_url or "",
            "joined": created_at_ist.strftime("%b %Y") if created_at_ist else "",
            "created_at": created_at_ist.isoformat() if created_at_ist else None,
            "updated_at": updated_at_ist.isoformat() if updated_at_ist else None
        }

    @classmethod
    def get_all_staff(cls, filters: dict = None) -> dict:
        """
        Retrieves all staff records applying dynamic lookup constraints.
        Searches strictly on Name, ID Badge, or 8-digit uniqueCode.
        Computes dynamic stats envelope matching shifts service architecture.
        """
        # Auto-seed mock data if DB is empty to maintain robust state
        cls.seed_initial_staff()

        queryset = Staff.objects.all().order_by('id')

        if filters:
            # 1. Broad Search Query (filters across name, id, uniqueCode exclusively)
            search = filters.get('search')
            if search:
                search_val = search.strip()
                queryset = queryset.filter(
                    Q(name__icontains=search_val) | 
                    Q(staff_code__icontains=search_val) | 
                    Q(unique_code__icontains=search_val)
                )

            # 2. Department / Role Selector
            dept = filters.get('dept')
            if dept and dept != 'all':
                queryset = queryset.filter(dept__iexact=dept.strip())

            # 3. Active Clearance Status
            status = filters.get('status')
            if status and status != 'all':
                queryset = queryset.filter(status__iexact=status.strip())

            # 4. Assigned Shift timing selector
            shift_id = filters.get('shiftId')
            if shift_id and shift_id != 'all':
                queryset = queryset.filter(shift__shift_code=shift_id.strip())

        staff_list = [cls.serialize_staff(member) for member in queryset]

        # Calculate stats on the full matching list
        total = len(staff_list)
        active_duty = sum(1 for m in staff_list if m.get("isCheckedIn"))
        on_leave = sum(1 for m in staff_list if m.get("status") == "on-leave")
        front_office = sum(
            1 for m in staff_list 
            if m.get("dept") and (
                "front" in m.get("dept").lower() or 
                "concierge" in m.get("dept").lower() or 
                "office" in m.get("dept").lower()
            )
        )

        stats = {
            "total": total,
            "activeDuty": active_duty,
            "onLeave": on_leave,
            "frontOffice": front_office
        }

        # Apply duty filter post-serialization (since isCheckedIn is computed dynamically)
        if filters:
            duty = filters.get('duty')
            if duty and duty != 'all':
                if duty == 'on-duty':
                    staff_list = [m for m in staff_list if m.get("isCheckedIn")]
                elif duty == 'offline':
                    staff_list = [m for m in staff_list if not m.get("isCheckedIn")]

        return {
            "staff": staff_list,
            "stats": stats
        }

    @classmethod
    def get_staff_by_id(cls, staff_id: str) -> dict:
        """
        Retrieves a single staff record by its unique STF ID.
        """
        try:
            member = Staff.objects.get(staff_code=staff_id.strip())
            return cls.serialize_staff(member)
        except Staff.DoesNotExist:
            return None

    @classmethod
    def generate_unique_code(cls) -> str:
        """
        Generates a secure random 8-digit numeric unique code.
        """
        while True:
            code = "".join([str(random.randint(0, 9)) for _ in range(8)])
            if not Staff.objects.filter(unique_code=code).exists():
                return code

    @classmethod
    def generate_next_staff_id(cls) -> str:
        """
        Generates the next sequential Staff ID.
        Format: STF-01 -> STF-02 -> STF-03.
        """
        last_member = Staff.objects.all().order_by('-id').first()
        if not last_member:
            return 'STF-01'
        
        last_id = last_member.staff_code
        try:
            parts = last_id.split('-')
            if len(parts) == 2 and parts[1].isdigit():
                next_num = int(parts[1]) + 1
                return f"STF-{next_num:02d}"
        except Exception:
            pass
        
        # Fallback to unique code sequence if parsing fails
        import uuid
        return f"STF-{uuid.uuid4().hex[:4].upper()}"

    @classmethod
    @transaction.atomic
    def create_staff(cls, data: dict, files=None) -> dict:
        """
        Registers and creates a new staff profile.
        Automatically provisions sequential STF IDs and 8-digit unique codes.
        """
        # Validate data
        data = StaffValidator.validate_onboard_data(data, is_update=False)

        # Generate credentials
        staff_id = cls.generate_next_staff_id()
        unique_code = cls.generate_unique_code()

        # Resolve Shift relationship
        shift_id = data.get('shift', '')
        if hasattr(shift_id, 'shift_code'):
            shift_instance = shift_id
        else:
            try:
                shift_instance = Shifts.objects.get(shift_code=str(shift_id).strip())
            except Shifts.DoesNotExist:
                raise ValueError(f"Shift timing selection with ID '{shift_id}' does not exist.")

        # Process binary scans uploads
        profile_file = files.get('profileFile') if files else None
        profile_file_name = data.get('profile_file_name', '').strip() if data.get('profile_file_name') else None
        profile_file_url = data.get('profile_file_url', '').strip() if data.get('profile_file_url') else None
        import os
        backend_url = os.environ.get('BACKEND_URL', 'http://localhost:8000')

        if profile_file:
            path = UploadService.upload_single_file(profile_file, subfolder=f"staff/{unique_code}")
            profile_file_url = path if path.startswith('http') else f"{backend_url}{path}"
            profile_file_name = profile_file.name

        govt_file = files.get('govtProofFile') if files else None
        govt_file_name = data.get('govt_proof_file_name', '').strip() if data.get('govt_proof_file_name') else None
        govt_file_url = data.get('govt_proof_file_url', '').strip() if data.get('govt_proof_file_url') else None
        if govt_file:
            path = UploadService.upload_single_file(govt_file, subfolder=f"staff/{unique_code}")
            govt_file_url = path if path.startswith('http') else f"{backend_url}{path}"
            govt_file_name = govt_file.name

        member = Staff(
            staff_code=staff_id,
            unique_code=unique_code,
            name=data.get('name', '').strip(),
            dept=data.get('dept', '').strip(),
            password=make_password(data.get('password', '').strip()) if data.get('password') else None,
            email=data.get('email', '').strip() if data.get('email') else None,
            phone_country=data.get('phone_country', '+91').strip(),
            phone_no=data.get('phone_no', '').strip(),
            emergency_country=data.get('emergency_country', '+91').strip(),
            emergency_no=data.get('emergency_no', '').strip(),
            shift=shift_instance,
            status=data.get('status', 'active').strip(),
            address=data.get('address', '').strip(),
            govt_proof_type=data.get('govt_proof_type', 'pan').strip(),
            govt_proof_id=data.get('govt_proof_id', '').strip(),
            govt_proof_file_name=govt_file_name,
            govt_proof_file_url=govt_file_url,
            profile_file_name=profile_file_name,
            profile_file_url=profile_file_url,
            is_checked_in=data.get('is_checked_in', False)
        )
        member.save()
        return cls.serialize_staff(member)

    @classmethod
    @transaction.atomic
    def update_staff(cls, staff_id: str, data: dict, files=None) -> dict:
        """
        Partially updates an existing staff profile after applying validators.
        """
        try:
            member = Staff.objects.get(staff_code=staff_id.strip())
        except Staff.DoesNotExist:
            return None

        # Validate updating payload
        data = StaffValidator.validate_onboard_data(data, is_update=True, current_instance=member)

        # Apply update operations
        if 'name' in data:
            member.name = data['name'].strip()
        if 'dept' in data:
            member.dept = data['dept'].strip()
        if 'password' in data and data['password'].strip():
            member.password = make_password(data['password'].strip())
        if 'email' in data:
            member.email = data['email'].strip() if data['email'] else None
        if 'phone_country' in data:
            member.phone_country = data['phone_country'].strip()
        if 'phone_no' in data:
            member.phone_no = data['phone_no'].strip()
        if 'emergency_country' in data:
            member.emergency_country = data['emergency_country'].strip()
        if 'emergency_no' in data:
            member.emergency_no = data['emergency_no'].strip()
        if 'status' in data:
            member.status = data['status'].strip()
        if 'address' in data:
            member.address = data['address'].strip()
        if 'govt_proof_type' in data:
            member.govt_proof_type = data['govt_proof_type'].strip()
        if 'govt_proof_id' in data:
            member.govt_proof_id = data['govt_proof_id'].strip()
        if 'is_checked_in' in data:
            member.is_checked_in = data['is_checked_in']

        import os
        backend_url = os.environ.get('BACKEND_URL', 'http://localhost:8000')

        # Process binary scans uploads
        profile_file = files.get('profileFile') if files else None
        if profile_file:
            path = UploadService.upload_single_file(profile_file, subfolder=f"staff/{member.unique_code}")
            member.profile_file_url = path if path.startswith('http') else f"{backend_url}{path}"
            member.profile_file_name = profile_file.name
        else:
            if 'profile_file_name' in data:
                member.profile_file_name = data['profile_file_name'].strip() if data['profile_file_name'] else None
            if 'profile_file_url' in data:
                member.profile_file_url = data['profile_file_url'].strip() if data['profile_file_url'] else None

        govt_file = files.get('govtProofFile') if files else None
        if govt_file:
            path = UploadService.upload_single_file(govt_file, subfolder=f"staff/{member.unique_code}")
            member.govt_proof_file_url = path if path.startswith('http') else f"{backend_url}{path}"
            member.govt_proof_file_name = govt_file.name
        else:
            if 'govt_proof_file_name' in data:
                member.govt_proof_file_name = data['govt_proof_file_name'].strip() if data['govt_proof_file_name'] else None
            if 'govt_proof_file_url' in data:
                member.govt_proof_file_url = data['govt_proof_file_url'].strip() if data['govt_proof_file_url'] else None

        if 'shift' in data:
            shift_id = data['shift']
            if hasattr(shift_id, 'shift_code'):
                member.shift = shift_id
            else:
                try:
                    shift_instance = Shifts.objects.get(shift_code=str(shift_id).strip())
                    member.shift = shift_instance
                except Shifts.DoesNotExist:
                    raise ValueError(f"Shift timing selection with ID '{shift_id}' does not exist.")

        member.save()
        return cls.serialize_staff(member)

    @classmethod
    def delete_staff(cls, staff_id: str) -> bool:
        """
        Retires and removes a staff member from active operations.
        """
        try:
            member = Staff.objects.get(staff_code=staff_id.strip())
            member.delete()
            return True
        except Staff.DoesNotExist:
            return False

    @classmethod
    @transaction.atomic
    def seed_initial_staff(cls):
        """
        Seeds default shifts if the database is empty.
        Ensures a beautiful, populated frontend onboarding experience on startup.
        """
        # Ensure default shifts exist first
        default_shifts = [
            {"id": "SHF-01", "name": "Morning Shift", "time": "07:00 AM - 03:00 PM", "icon": "sun", "color": "emerald"},
            {"id": "SHF-02", "name": "Afternoon Shift", "time": "03:00 PM - 11:00 PM", "icon": "sunset", "color": "orange"},
            {"id": "SHF-03", "name": "Night Shift", "time": "11:00 PM - 07:00 AM", "icon": "moon", "color": "indigo"},
            {"id": "SHF-04", "name": "Administration Shift", "time": "09:00 AM - 05:00 PM", "icon": "briefcase", "color": "blue"}
        ]
        for s in default_shifts:
            if not Shifts.objects.filter(shift_code=s["id"]).exists():
                Shifts.objects.create(
                    shift_code=s["id"],
                    name=s["name"],
                    time=s["time"],
                    icon=s["icon"],
                    color=s["color"]
                )


