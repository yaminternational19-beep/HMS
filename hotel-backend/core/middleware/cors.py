from django.http import HttpResponse

class CORSMiddleware:
    """
    Custom zero-dependency CORS Middleware for handling cross-origin requests
    and preflight OPTIONS requests without external package dependencies.
    """
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        # Intercept and answer preflight OPTIONS request immediately
        if request.method == 'OPTIONS':
            response = HttpResponse()
            response['Access-Control-Allow-Origin'] = '*'
            response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
            response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept'
            response['Access-Control-Max-Age'] = '86400'
            return response

        # Process normal request
        response = self.get_response(request)
        
        # Attach CORS headers to outgoing response
        response['Access-Control-Allow-Origin'] = '*'
        response['Access-Control-Allow-Methods'] = 'GET, POST, PUT, DELETE, OPTIONS'
        response['Access-Control-Allow-Headers'] = 'Content-Type, Authorization, X-Requested-With, Accept'
        
        return response
