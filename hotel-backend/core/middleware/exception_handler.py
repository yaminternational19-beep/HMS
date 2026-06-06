import logging
from django.http import JsonResponse
from django.conf import settings
from core.services.statuscodes import StatusCodes

logger = logging.getLogger('hms.middleware.exceptions')

class APIExceptionMiddleware:
    """
    Middleware that intercepts unhandled exceptions escaping from views or lower middlewares.
    Returns a clean, structured JSON response with status code 500.
    Hides detailed traceback messages in production (when settings.DEBUG is False) for security.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
            return response
        except Exception as exc:
            # Log the traceback using standard Django/Python logging
            logger.exception("Unhandled Server Exception caught by APIExceptionMiddleware")

            # Determine error message based on debug setting to prevent data leakage in production
            error_details = str(exc) if getattr(settings, 'DEBUG', False) else "Internal Server Error"

            response_data = {
                "success": False,
                "message": "An unexpected server error occurred.",
                "errors": {
                    "server": error_details
                }
            }
            return JsonResponse(response_data, status=StatusCodes.INTERNAL_SERVER_ERROR)
