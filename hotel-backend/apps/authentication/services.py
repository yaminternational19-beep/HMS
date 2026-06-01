from core.services.jwt_service import JWTService
from .models import SuperAdmin

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
            "role": user.role
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
