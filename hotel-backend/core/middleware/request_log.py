import time
import logging

logger = logging.getLogger('hms.middleware.requests')

class RequestLogMiddleware:
    """
    Middleware that measures request processing time and logs details
    (HTTP method, path, status code, duration, and client IP) using 
    Python's standard logging library.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        start_time = time.perf_counter()

        response = self.get_response(request)

        duration = time.perf_counter() - start_time

        # Extract client IP address
        x_forwarded_for = request.META.get('HTTP_X_FORWARDED_FOR')
        if x_forwarded_for:
            ip = x_forwarded_for.split(',')[0].strip()
        else:
            ip = request.META.get('REMOTE_ADDR', 'unknown')

        # Log details in structured format
        log_data = {
            'method': request.method,
            'path': request.path,
            'status': response.status_code,
            'duration': f"{duration:.2f}s",
            'ip': ip
        }

        # Use standard logger instead of print statement
        logger.info(log_data)

        return response
