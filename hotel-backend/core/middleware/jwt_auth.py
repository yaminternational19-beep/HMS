from django.utils.deprecation import MiddlewareMixin
from core.services.jwt_service import JWTService
from apps.authentication.models import SuperAdmin

class JWTAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware that authenticates requests using JWT in the Authorization header.
    Attaches the authenticated SuperAdmin object to request.staff.
    """
    def process_request(self, request):
        request.staff = None
        
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return
            
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return
            
        token = parts[1]
        try:
            payload = JWTService.decode_token(token)
            user_id = payload.get('user_id')
            if user_id:
                try:
                    super_admin = SuperAdmin.objects.get(id=user_id, is_active=True)
                    request.staff = super_admin
                except SuperAdmin.DoesNotExist:
                    pass
        except ValueError:
            # Token is invalid or expired
            pass

from functools import wraps
from core.response.api_response import error_response
from core.services.statuscodes import StatusCodes

def jwt_required(view_func):
    """
    Decorator to protect API views. Ensures the request has been authenticated via JWT middleware.
    """
    @wraps(view_func)
    def wrapped_view(request, *args, **kwargs):
        if not getattr(request, 'staff', None):
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


from apps.superadmin.staff.models import Staff

class StaffJWTAuthenticationMiddleware(MiddlewareMixin):
    """
    Middleware that authenticates front-office staff/employees using JWT in the Authorization header.
    Attaches the authenticated Staff object to request.employee.
    """
    def process_request(self, request):
        request.employee = None
        
        auth_header = request.headers.get('Authorization')
        if not auth_header:
            return
            
        parts = auth_header.split()
        if len(parts) != 2 or parts[0].lower() != 'bearer':
            return
            
        token = parts[1]
        try:
            payload = JWTService.decode_token(token)
            employee_id = payload.get('employee_id')
            if employee_id:
                try:
                    staff_member = Staff.objects.get(id=employee_id, status='active')
                    request.employee = staff_member
                except Staff.DoesNotExist:
                    pass
        except ValueError:
            # Token is invalid or expired
            pass


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



