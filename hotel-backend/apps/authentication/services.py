from core.services.jwt_service import JWTService
from .models import SuperAdmin
from django.db.models import Q
from apps.superadmin.staff.models import Staff
from django.contrib.auth.hashers import check_password

class SuperAdminAuthService:
    """
    Service layer handling all Super Admin authentication business logic.
    """
    
    @staticmethod
    def authenticate_superadmin(email: str, password: str) -> tuple:
        """
        Authenticates a super admin user strictly using database records.
        Returns a tuple: (auth_data, error_message).
        On success: (auth_dict, None)
        On failure: (None, error_message)
        """
        email_clean = email.strip().lower()

        # 1. Check if the email exists in the database
        email_exists = SuperAdmin.objects.filter(email=email_clean, is_active=True, role='super_admin').exists()
        
        if not email_exists:
            # Email does not exist
            return None, "Check your email"

        try:
            # Query strictly for the active Super Admin in the database
            user = SuperAdmin.objects.get(email=email_clean, is_active=True, role='super_admin')
        except SuperAdmin.DoesNotExist:
            return None, "Invalid credentials"

        # 2. Verify secure hashed password directly using the database record
        if not user.check_password(password):
            # Password is incorrect
            return None, "Password is wrong"

        # Generate JWT Token payload
        token_payload = {
            "user_id": user.id,
            "email": user.email,
            "role": user.role,
            "aud": "hotel-admin"
        }
        token = JWTService.generate_token(token_payload)

        # Build profile payload
        profile = {
            "id": user.id,
            "name": user.name,
            "email": user.email,
            "role": user.role,
            "is_active": user.is_active
        }

        return {
            "token": token,
            "profile": profile
        }, None


class StaffAuthService:
    """
    Service layer handling all Front Office/Staff authentication business logic.
    """
    
    @staticmethod
    def authenticate_staff(staff_code: str, password: str) -> tuple:
        """
        Authenticates a staff member strictly using database records.
        Matches staff_code against id OR uniqueCode.
        Returns a tuple: (auth_data, error_message).
        """
        # Ensure initial staff records exist before authentication
        from apps.superadmin.staff.services import StaffService
        StaffService.seed_initial_staff()

        staff_code_clean = staff_code.strip()
        
        # 1. Lookup staff member by id (e.g. STF-02) or uniqueCode (e.g. 29384756)
        try:
            member = Staff.objects.get(
                Q(id=staff_code_clean) | Q(uniqueCode=staff_code_clean),
                status='active'
            )
        except Staff.DoesNotExist:
            return None, "Check your staff code"

        # 2. Restrict to Front Office and Maintenance roles only
        role_lower = member.dept.lower() if member.dept else ''
        is_operational = 'front' in role_lower or 'maintain' in role_lower or 'concierge' in role_lower or 'clerk' in role_lower or 'desk' in role_lower
        if not is_operational:
            return None, "Access denied. Only Front Office and Maintenance role employees can log in."

        # 3. Check if a password is set
        if not member.password:
            return None, "Login credentials not configured for this staff member."

        # 4. Verify hashed password
        if not check_password(password.strip(), member.password):
            return None, "Password is wrong"

        # 5. Verify current time is within shift login window
        if member.shift and member.shift.time:
            from zoneinfo import ZoneInfo
            from datetime import datetime
            ist_tz = ZoneInfo('Asia/Kolkata')
            current_dt = datetime.now(ist_tz)
            if not JWTService.is_within_shift_login_window(member.shift.time, current_dt):
                return None, f"Login denied. You can only log in during your assigned shift: {member.shift.name} ({member.shift.time}) plus a 2-hour grace period."

        # Generate JWT Token payload (separate employee payload)
        token_payload = {
            "employee_id": member.id,
            "unique_code": member.uniqueCode,
            "email": member.email,
            "role": member.dept,
            "aud": "hotel-frontoffice"
        }
        token = JWTService.generate_token(token_payload)

        # Build profile payload
        profile = {
            "id": member.id,
            "uniqueCode": member.uniqueCode,
            "name": member.name,
            "email": member.email,
            "role": member.dept,
            "status": member.status
        }

        # Create a login log
        from apps.superadmin.staff.models import StaffLog
        StaffLog.objects.create(staff=member, action='login')

        return {
            "token": token,
            "profile": profile
        }, None
