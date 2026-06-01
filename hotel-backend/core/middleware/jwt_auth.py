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

