from rest_framework.throttling import SimpleRateThrottle

class HMSRateThrottle(SimpleRateThrottle):
    """
    Custom Rate Limiter subclassing DRF's SimpleRateThrottle.
    Resolves throttle scope and rate dynamically:
    - Checks view instance (class-based views).
    - Checks resolved view function via request.resolver_match (function-based views).
    - Defaults to 'hms_default'.
    """
    def __init__(self):
        # Override init to defer rate/scope resolution to allow_request phase
        pass

    def allow_request(self, request, view):
        # 1. Resolve throttle scope dynamically
        self.scope = self.resolve_throttle_scope(view, request)
        if not self.scope:
            return True
            
        # 2. Resolve rate configuration for the determined scope
        self.rate = self.get_rate()
        self.num_requests, self.duration = self.parse_rate(self.rate)
        
        # 3. Proceed with standard SimpleRateThrottle validation
        if self.rate is None:
            return True

        self.key = self.get_cache_key(request, view)
        if self.key is None:
            return True

        self.history = self.cache.get(self.key, [])
        self.now = self.timer()

        # Drop old requests from the history sliding window
        while self.history and self.history[-1] <= self.now - self.duration:
            self.history.pop()
            
        if len(self.history) >= self.num_requests:
            return self.throttle_failure()
            
        self.history.insert(0, self.now)
        self.cache.set(self.key, self.history, self.duration)
        return True

    def resolve_throttle_scope(self, view, request):
        # Check class-based view direct attribute
        scope = getattr(view, 'throttle_scope', None)
        if scope:
            return scope
            
        # Check resolved view function from URL routing (resolves function-based views)
        resolver_match = getattr(request, 'resolver_match', None)
        if resolver_match and resolver_match.func:
            func = resolver_match.func
            if hasattr(func, 'throttle_scope'):
                return getattr(func, 'throttle_scope')
                
            # Fallback for nested wrappers (check closures)
            if hasattr(func, '__closure__') and func.__closure__:
                for cell in func.__closure__:
                    contents = cell.cell_contents
                    if callable(contents) and hasattr(contents, 'throttle_scope'):
                        return getattr(contents, 'throttle_scope')
                        
        return 'hms_default'

    def get_cache_key(self, request, view):
        staff = getattr(request, 'staff', None)
        if staff and hasattr(staff, 'id'):
            ident = f"staff_{staff.id}"
        else:
            employee = getattr(request, 'employee', None)
            if employee and hasattr(employee, 'id'):
                ident = f"employee_{employee.id}"
            else:
                ident = self.get_ident(request)
                
        return self.cache_format % {
            'scope': self.scope,
            'ident': ident
        }
