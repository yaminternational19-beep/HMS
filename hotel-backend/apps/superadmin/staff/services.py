import random
from django.db import transaction
from django.db.models import Q
from .models import Staff
from apps.superadmin.shifts.models import Shifts
from .validators import StaffValidator
from core.services.upload_service import UploadService

class StaffService:
    """
    Service Layer implementing business transactions, sequential ID routing,
    8-digit unique code allocation, dynamic search-matching, and mock seeding.
    """

    @staticmethod
    def serialize_staff(member: Staff) -> dict:
        """
        Transforms a database Staff model record to a React-friendly dictionary format.
        """
        if not member:
            return {}
        return {
            "id": member.id,
            "uniqueCode": member.uniqueCode,
            "name": member.name,
            "dept": member.dept,
            "role": member.dept,
            "password": member.password,
            "email": member.email or "",
            "phoneCountry": member.phoneCountry,
            "phoneNo": member.phoneNo,
            "phone": f"{member.phoneCountry} {member.phoneNo}",
            "emergencyCountry": member.emergencyCountry,
            "emergencyNo": member.emergencyNo,
            "emergencyPhone": f"{member.emergencyCountry} {member.emergencyNo}",
            "shiftId": member.shift_id,
            "status": member.status,
            "isCheckedIn": member.isCheckedIn,
            "address": member.address,
            "govtProofType": member.govtProofType,
            "govtProofId": member.govtProofId,
            "govtProofFileName": member.govtProofFileName or "",
            "govtProofFileUrl": member.govtProofFileUrl or "",
            "profileFileName": member.profileFileName or "",
            "profileFileUrl": member.profileFileUrl or "",
            "joined": member.created_at.strftime("%b %Y") if member.created_at else "",
            "logs": [
                { "id": 101, "date": 'May 22, 2026', "checkIn": '08:30 AM', "checkOut": '06:00 PM', "duration": '9h 30m' },
                { "id": 102, "date": 'May 21, 2026', "checkIn": '08:45 AM', "checkOut": '05:45 PM', "duration": '9h 00m' }
            ] if member.id == 'STF-01' else [
                { "id": 201, "date": 'May 22, 2026', "checkIn": '09:00 AM', "checkOut": '05:00 PM', "duration": '8h 00m' },
                { "id": 202, "date": 'May 21, 2026', "checkIn": '08:50 AM', "checkOut": '05:10 PM', "duration": '8h 20m' }
            ] if member.id == 'STF-02' else [
                { "id": 301, "date": 'May 22, 2026', "checkIn": '10:00 AM', "checkOut": '06:00 PM', "duration": '8h 00m' }
            ] if member.id == 'STF-03' else [
                { "id": 401, "date": 'May 22, 2026', "checkIn": '08:00 AM', "checkOut": '04:00 PM', "duration": '8h 00m' }
            ] if member.id == 'STF-04' else [
                { "id": 501, "date": 'May 15, 2026', "checkIn": '08:30 AM', "checkOut": '05:30 PM', "duration": '9h 00m' }
            ] if member.id == 'STF-05' else [
                { "id": 601, "date": 'May 22, 2026', "checkIn": '11:00 AM', "checkOut": '08:00 PM', "duration": '9h 00m' }
            ] if member.id == 'STF-06' else [
                { "id": 701, "date": 'May 22, 2026', "checkIn": '09:00 AM', "checkOut": '05:00 PM', "duration": '8h 00m' }
            ],
            "created_at": member.created_at.isoformat() if member.created_at else None,
            "updated_at": member.updated_at.isoformat() if member.updated_at else None
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
                    Q(id__icontains=search_val) | 
                    Q(uniqueCode__icontains=search_val)
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
                queryset = queryset.filter(shift_id=shift_id.strip())

            # 5. Duty Status (isCheckedIn)
            duty = filters.get('duty')
            if duty and duty != 'all':
                if duty == 'on-duty':
                    queryset = queryset.filter(isCheckedIn=True)
                elif duty == 'offline':
                    queryset = queryset.filter(isCheckedIn=False)

        staff_list = [cls.serialize_staff(member) for member in queryset]

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
            member = Staff.objects.get(id=staff_id.strip())
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
            if not Staff.objects.filter(uniqueCode=code).exists():
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
        
        last_id = last_member.id
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
        shift_id = data.get('shift_id', '').strip()
        try:
            shift_instance = Shifts.objects.get(id=shift_id)
        except Shifts.DoesNotExist:
            raise ValueError(f"Shift timing selection with ID '{shift_id}' does not exist.")

        # Process binary scans uploads
        profile_file = files.get('profileFile') if files else None
        profile_file_name = data.get('profileFileName', '').strip() if data.get('profileFileName') else None
        profile_file_url = data.get('profileFileUrl', '').strip() if data.get('profileFileUrl') else None
        if profile_file:
            path = UploadService.upload_single_file(profile_file, subfolder=f"staff/{unique_code}")
            profile_file_url = f"http://localhost:8000{path}"
            profile_file_name = profile_file.name

        govt_file = files.get('govtProofFile') if files else None
        govt_file_name = data.get('govtProofFileName', '').strip() if data.get('govtProofFileName') else None
        govt_file_url = data.get('govtProofFileUrl', '').strip() if data.get('govtProofFileUrl') else None
        if govt_file:
            path = UploadService.upload_single_file(govt_file, subfolder=f"staff/{unique_code}")
            govt_file_url = f"http://localhost:8000{path}"
            govt_file_name = govt_file.name

        member = Staff(
            id=staff_id,
            uniqueCode=unique_code,
            name=data.get('name', '').strip(),
            dept=data.get('dept', '').strip(),
            password=data.get('password', '').strip() if data.get('password') else None,
            email=data.get('email', '').strip() if data.get('email') else None,
            phoneCountry=data.get('phoneCountry', '+971').strip(),
            phoneNo=data.get('phoneNo', '').strip(),
            emergencyCountry=data.get('emergencyCountry', '+971').strip(),
            emergencyNo=data.get('emergencyNo', '').strip(),
            shift=shift_instance,
            status=data.get('status', 'active').strip(),
            address=data.get('address', '').strip(),
            govtProofType=data.get('govtProofType', 'Passport').strip(),
            govtProofId=data.get('govtProofId', '').strip(),
            govtProofFileName=govt_file_name,
            govtProofFileUrl=govt_file_url,
            profileFileName=profile_file_name,
            profileFileUrl=profile_file_url,
            isCheckedIn=data.get('isCheckedIn', False)
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
            member = Staff.objects.get(id=staff_id.strip())
        except Staff.DoesNotExist:
            return None

        # Validate updating payload
        data = StaffValidator.validate_onboard_data(data, is_update=True, current_instance=member)

        # Apply update operations
        if 'name' in data:
            member.name = data['name'].strip()
        if 'dept' in data:
            member.dept = data['dept'].strip()
        if 'password' in data:
            member.password = data['password'].strip() if data['password'] else None
        if 'email' in data:
            member.email = data['email'].strip() if data['email'] else None
        if 'phoneCountry' in data:
            member.phoneCountry = data['phoneCountry'].strip()
        if 'phoneNo' in data:
            member.phoneNo = data['phoneNo'].strip()
        if 'emergencyCountry' in data:
            member.emergencyCountry = data['emergencyCountry'].strip()
        if 'emergencyNo' in data:
            member.emergencyNo = data['emergencyNo'].strip()
        if 'status' in data:
            member.status = data['status'].strip()
        if 'address' in data:
            member.address = data['address'].strip()
        if 'govtProofType' in data:
            member.govtProofType = data['govtProofType'].strip()
        if 'govtProofId' in data:
            member.govtProofId = data['govtProofId'].strip()
        if 'isCheckedIn' in data:
            member.isCheckedIn = data['isCheckedIn']

        # Process binary scans uploads
        profile_file = files.get('profileFile') if files else None
        if profile_file:
            path = UploadService.upload_single_file(profile_file, subfolder=f"staff/{member.uniqueCode}")
            member.profileFileUrl = f"http://localhost:8000{path}"
            member.profileFileName = profile_file.name
        else:
            if 'profileFileName' in data:
                member.profileFileName = data['profileFileName'].strip() if data['profileFileName'] else None
            if 'profileFileUrl' in data:
                member.profileFileUrl = data['profileFileUrl'].strip() if data['profileFileUrl'] else None

        govt_file = files.get('govtProofFile') if files else None
        if govt_file:
            path = UploadService.upload_single_file(govt_file, subfolder=f"staff/{member.uniqueCode}")
            member.govtProofFileUrl = f"http://localhost:8000{path}"
            member.govtProofFileName = govt_file.name
        else:
            if 'govtProofFileName' in data:
                member.govtProofFileName = data['govtProofFileName'].strip() if data['govtProofFileName'] else None
            if 'govtProofFileUrl' in data:
                member.govtProofFileUrl = data['govtProofFileUrl'].strip() if data['govtProofFileUrl'] else None

        if 'shift_id' in data:
            shift_id = data['shift_id'].strip()
            try:
                shift_instance = Shifts.objects.get(id=shift_id)
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
            member = Staff.objects.get(id=staff_id.strip())
            member.delete()
            return True
        except Staff.DoesNotExist:
            return False

    @classmethod
    @transaction.atomic
    def seed_initial_staff(cls):
        """
        Seeds default shifts and mock employees if the database is empty.
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
            if not Shifts.objects.filter(id=s["id"]).exists():
                Shifts.objects.create(
                    id=s["id"],
                    name=s["name"],
                    time=s["time"],
                    icon=s["icon"],
                    color=s["color"]
                )

        # Seed staff only if empty
        if Staff.objects.count() > 0:
            return

        mock_staff = [
            {
                "id": "STF-01",
                "uniqueCode": "83719273",
                "name": "Praveen Reddy",
                "dept": "Corporate Director",
                "email": "praveen@hms.com",
                "phoneCountry": "+971",
                "phoneNo": "50 123 4567",
                "emergencyCountry": "+971",
                "emergencyNo": "50 999 1111",
                "shift_id": "SHF-04",
                "status": "active",
                "isCheckedIn": True,
                "address": "Villa 12, Palm Jumeirah, Dubai, UAE",
                "govtProofType": "Passport",
                "govtProofId": "DXB-983726-P",
                "govtProofFileName": "passport_scan_praveen.pdf",
                "govtProofFileUrl": "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=500&auto=format&fit=crop",
                "profileFileName": "profile_praveen.jpg",
                "profileFileUrl": "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=500&auto=format&fit=crop"
            },
            {
                "id": "STF-02",
                "uniqueCode": "29384756",
                "name": "Sarah Connor",
                "dept": "Front Desk Manager",
                "password": "SarahHMS2026",
                "email": "sarah.c@hms.com",
                "phoneCountry": "+971",
                "phoneNo": "50 234 5678",
                "emergencyCountry": "+971",
                "emergencyNo": "50 999 2222",
                "shift_id": "SHF-01",
                "status": "active",
                "isCheckedIn": False,
                "address": "Apt 204, Downtown Boulevard, Dubai, UAE",
                "govtProofType": "National ID",
                "govtProofId": "784-1995-1234567-1",
                "govtProofFileName": "emirates_id_front_sarah.jpg",
                "govtProofFileUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop",
                "profileFileName": "profile_sarah.jpg",
                "profileFileUrl": "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=500&auto=format&fit=crop"
            },
            {
                "id": "STF-03",
                "uniqueCode": "50192837",
                "name": "John Doe",
                "dept": "Concierge Clerk",
                "password": "JohnHMS2026",
                "email": "john.doe@hms.com",
                "phoneCountry": "+971",
                "phoneNo": "50 345 6789",
                "emergencyCountry": "+971",
                "emergencyNo": "50 999 3333",
                "shift_id": "SHF-02",
                "status": "active",
                "isCheckedIn": False,
                "address": "Building A-1, Al Barsha Heights, Dubai, UAE",
                "govtProofType": "Driver License",
                "govtProofId": "DL-2023-887162",
                "govtProofFileName": "uae_license_johndoe.png",
                "govtProofFileUrl": "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500&auto=format&fit=crop",
                "profileFileName": "profile_johndoe.jpg",
                "profileFileUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop"
            },
            {
                "id": "STF-04",
                "uniqueCode": "49382716",
                "name": "Maria Gonzalez",
                "dept": "Executive Housekeeper",
                "email": "maria.g@hms.com",
                "phoneCountry": "+971",
                "phoneNo": "50 456 7890",
                "emergencyCountry": "+971",
                "emergencyNo": "50 999 4444",
                "shift_id": "SHF-01",
                "status": "active",
                "isCheckedIn": True,
                "address": "Flat 10, Jumeirah Village Circle, Dubai, UAE",
                "govtProofType": "National ID",
                "govtProofId": "784-1988-7654321-2",
                "govtProofFileName": "emirates_id_front_maria.png",
                "govtProofFileUrl": "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=500&auto=format&fit=crop",
                "profileFileName": "profile_maria.jpg",
                "profileFileUrl": "https://images.unsplash.com/photo-1548142813-c348350df52b?w=500&auto=format&fit=crop"
            },
            {
                "id": "STF-05",
                "uniqueCode": "60293847",
                "name": "David Smith",
                "dept": "Maintenance Lead",
                "password": "DavidHMS2026",
                "email": "",
                "phoneCountry": "+971",
                "phoneNo": "50 567 8901",
                "emergencyCountry": "+971",
                "emergencyNo": "50 999 5555",
                "shift_id": "SHF-03",
                "status": "on-leave",
                "isCheckedIn": False,
                "address": "Street 4B, Al Quoz Industrial Area, Dubai, UAE",
                "govtProofType": "Driver License",
                "govtProofId": "DL-2019-992019",
                "govtProofFileName": "driver_license_david.jpg",
                "govtProofFileUrl": "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=500&auto=format&fit=crop",
                "profileFileName": "profile_david.jpg",
                "profileFileUrl": "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=500&auto=format&fit=crop"
            },
            {
                "id": "STF-06",
                "uniqueCode": "71029384",
                "name": "Alex Wong",
                "dept": "Head Chef",
                "email": "alex.w@hms.com",
                "phoneCountry": "+971",
                "phoneNo": "50 678 9012",
                "emergencyCountry": "+971",
                "emergencyNo": "50 999 6666",
                "shift_id": "SHF-02",
                "status": "active",
                "isCheckedIn": False,
                "address": "Penthouse 3, Dubai Marina Heights, Dubai, UAE",
                "govtProofType": "Passport",
                "govtProofId": "HKG-887162-W",
                "govtProofFileName": "passport_scan_alexwong.pdf",
                "govtProofFileUrl": "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=500&auto=format&fit=crop",
                "profileFileName": "profile_alex.jpg",
                "profileFileUrl": "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=500&auto=format&fit=crop"
            }
        ]

        for s_data in mock_staff:
            shift_inst = Shifts.objects.get(id=s_data["shift_id"])
            Staff.objects.create(
                id=s_data["id"],
                uniqueCode=s_data["uniqueCode"],
                name=s_data["name"],
                dept=s_data["dept"],
                password=s_data.get("password"),
                email=s_data.get("email"),
                phoneCountry=s_data["phoneCountry"],
                phoneNo=s_data["phoneNo"],
                emergencyCountry=s_data["emergencyCountry"],
                emergencyNo=s_data["emergencyNo"],
                shift=shift_inst,
                status=s_data["status"],
                isCheckedIn=s_data["isCheckedIn"],
                address=s_data["address"],
                govtProofType=s_data["govtProofType"],
                govtProofId=s_data["govtProofId"],
                govtProofFileName=s_data.get("govtProofFileName"),
                govtProofFileUrl=s_data.get("govtProofFileUrl"),
                profileFileName=s_data.get("profileFileName"),
                profileFileUrl=s_data.get("profileFileUrl")
            )
