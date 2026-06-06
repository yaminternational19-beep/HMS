from rest_framework.views import exception_handler
from core.response.api_response import error_response
from core.services.statuscodes import StatusCodes
from rest_framework.exceptions import Throttled
from django.http import JsonResponse

def custom_exception_handler(exc, context):
    """
    Custom exception handler for Django REST Framework.
    Intercepts all DRF exceptions to return a unified HMS response structure.
    """
    # Call default handler first
    response = exception_handler(exc, context)
    
    if response is not None:
        status_code = response.status_code
        data = response.data
        
        # Determine standard messages for common HTTP exceptions
        if status_code == 400:
            message = "Validation failed."
        elif status_code == 401:
            message = "Authentication credentials were not provided or are invalid."
        elif status_code == 403:
            message = "You do not have permission to perform this action."
        elif status_code == 404:
            message = "The requested resource was not found."
        elif status_code == 429:
            message = "Too many requests. Please try again later."
        else:
            message = "An API error occurred."

        # Map response data to a structured errors dictionary
        errors = {}
        if isinstance(data, dict):
            if 'detail' in data:
                detail_msg = data['detail']
                message = str(detail_msg)
                errors = {"detail": detail_msg}
            else:
                errors = data
        elif isinstance(data, list):
            errors = {"non_field_errors": data}
        else:
            errors = {"detail": str(data)}
            
        # Throttled exceptions specific formatting (to ensure test compatibility)
        if isinstance(exc, Throttled):
            wait_seconds = int(getattr(exc, 'wait', 0) or 0)
            errors = {
                "rate_limit": f"Limit exceeded. Expected available in {wait_seconds} seconds."
            }
            message = "Too many requests. Please try again later."

        return error_response(
            message=message,
            errors=errors,
            status_code=status_code
        )
        
    return response


# =====================================================================
# Django Core Root Handlers (for requests outside DRF flow)
# =====================================================================

def csrf_failure(request, reason=""):
    """
    Custom CSRF failure handler. Returns a unified JSON error response.
    """
    return JsonResponse({
        "success": False,
        "message": "CSRF verification failed. Request aborted.",
        "errors": {
            "csrf": reason or "CSRF token missing or incorrect."
        }
    }, status=StatusCodes.FORBIDDEN)


def handler404(request, exception=None):
    """
    Custom 404 page-not-found handler for unregistered route URLs.
    """
    return JsonResponse({
        "success": False,
        "message": "The requested API endpoint does not exist.",
        "errors": {
            "route": "Invalid path or URL route."
        }
    }, status=StatusCodes.NOT_FOUND)


def handler500(request):
    """
    Custom 500 internal server error fallback handler.
    """
    return JsonResponse({
        "success": False,
        "message": "An unexpected server error occurred.",
        "errors": {
            "server": "Internal Server Error"
        }
    }, status=StatusCodes.INTERNAL_SERVER_ERROR)
