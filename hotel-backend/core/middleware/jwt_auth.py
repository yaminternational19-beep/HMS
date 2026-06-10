from django.utils.deprecation import MiddlewareMixin
from core.services.jwt_service import JWTService
from apps.authentication.models import SuperAdmin
from apps.superadmin.staff.models import Staff
from functools import wraps
from core.response.api_response import error_response
from core.services.statuscodes import StatusCodes

class JWTAuthenticationMiddleware(MiddlewareMixin):
    """
    Consolidated Middleware that authenticates requests using JWT in the Authorization header.
    Decodes the token exactly once and dynamically resolves the identity:
    - Attaches the SuperAdmin object to request.staff if user_id is found.
    - Attaches the Staff object to request.employee if employee_id is found and validates their shift.
    """
    def process_request(self, request):
        request.staff = None
        request.employee = None
        
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return
            
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return
            
        token = parts[1]
        try:
            # Decode token once
            payload = JWTService.decode_token(token)
            
            aud = payload.get('aud')
            
            # 1. Try SuperAdmin lookup
            if aud == 'hotel-admin':
                user_id = payload.get('user_id')
                if user_id:
                    try:
                        super_admin = SuperAdmin.objects.get(id=user_id, is_active=True)
                        request.staff = super_admin
                    except SuperAdmin.DoesNotExist:
                        pass
                return
                
            # 2. Try Staff/Employee lookup
            elif aud == 'hotel-frontoffice':
                employee_id = payload.get('employee_id')
                iat = payload.get('iat')
                if employee_id:
                    try:
                        # Optimized with select_related to load shift profile in a single query
                        staff_member = Staff.objects.select_related('shift').get(staff_code=employee_id, status='active')
                        
                        # Verify if the token is still valid for the employee's shift
                        from zoneinfo import ZoneInfo
                        from datetime import datetime
                        ist_tz = ZoneInfo('Asia/Kolkata')
                        current_dt = datetime.now(ist_tz)
                        
                        if staff_member.shift and staff_member.shift.time:
                            if not JWTService.is_token_valid_for_shift(staff_member.shift.time, iat, current_dt):
                                raise ValueError("Session token has expired for this shift.")
                        
                        request.employee = staff_member
                    except Staff.DoesNotExist:
                        pass
                return
                
        except ValueError:
            # Token is invalid or expired
            pass


def jwt_required(view_func):
    """
    Decorator to protect API views. Ensures the request has been authenticated via JWT middleware.
    Allows either SuperAdmin (request.staff) or Staff/Employee (request.employee).
    """
    @wraps(view_func)
    def wrapped_view(request, *args, **kwargs):
        if not getattr(request, 'staff', None) and not getattr(request, 'employee', None):
            return error_response(
                message="Unauthorized. Valid JWT token is required.",
                errors={"auth": "Missing or invalid token"},
                status_code=StatusCodes.UNAUTHORIZED
            )
        return view_func(request, *args, **kwargs)
    return wrapped_view

def superadmin_required(view_func):
    """
    Decorator that ensures a valid JWT is present AND the authenticated user is strictly a Super Admin.
    """
    @wraps(view_func)
    def wrapped_view(request, *args, **kwargs):
        user = getattr(request, 'staff', None)
        if not user:
            return error_response(
                message="Unauthorized. Valid JWT token is required.",
                errors={"auth": "Missing or invalid token"},
                status_code=StatusCodes.UNAUTHORIZED
            )
            
        if getattr(user, 'role', '') != 'super_admin':
            return error_response(
                message="Forbidden. Only Super Admins are authorized to perform this operation.",
                errors={"auth": "Insufficient privileges"},
                status_code=StatusCodes.FORBIDDEN
            )
            
        return view_func(request, *args, **kwargs)
    return wrapped_view

def employee_required(view_func):
    """
    Decorator that ensures a valid employee/staff JWT is present.
    """
    @wraps(view_func)
    def wrapped_view(request, *args, **kwargs):
        if not getattr(request, 'employee', None):
            return error_response(
                message="Unauthorized. Valid employee/staff JWT token is required.",
                errors={"auth": "Missing or invalid token"},
                status_code=StatusCodes.UNAUTHORIZED
            )
        return view_func(request, *args, **kwargs)
    return wrapped_view
