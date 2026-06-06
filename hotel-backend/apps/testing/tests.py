from django.test import TestCase
from django.core.cache import cache
from core.services.statuscodes import StatusCodes
from rest_framework.settings import api_settings

class RateLimitTests(TestCase):
    
    def setUp(self):
        # Dynamically set the default rate to 2/m for testing in-place
        self.original_rate = api_settings.DEFAULT_THROTTLE_RATES.get('hms_default')
        api_settings.DEFAULT_THROTTLE_RATES['hms_default'] = '2/m'
        # Clear cache before each test to ensure fresh limit window
        cache.clear()

    def tearDown(self):
        # Restore original rates in-place
        if self.original_rate is not None:
            api_settings.DEFAULT_THROTTLE_RATES['hms_default'] = self.original_rate
        else:
            api_settings.DEFAULT_THROTTLE_RATES.pop('hms_default', None)
        # Clear cache after each test
        cache.clear()

    def test_default_rate_limiting(self):
        """
        Verify that requests are throttled after exceeding the default rate limit.
        Since RATE_LIMIT_DEFAULT is overridden to '2/m', the 3rd request should fail with 429.
        """
        # First request - Should succeed
        response1 = self.client.get('/api/test/')
        self.assertEqual(response1.status_code, StatusCodes.OK)
        
        # Second request - Should succeed
        response2 = self.client.get('/api/test/')
        self.assertEqual(response2.status_code, StatusCodes.OK)
        
        # Third request - Should fail (Too Many Requests)
        response3 = self.client.get('/api/test/')
        self.assertEqual(response3.status_code, StatusCodes.TOO_MANY_REQUESTS)
        
        # Verify custom error response format
        data = response3.json()
        self.assertFalse(data['success'])
        self.assertEqual(data['message'], "Too many requests. Please try again later.")
        self.assertIn("Limit exceeded", data['errors']['rate_limit'])

    def test_custom_rate_limit_decorator(self):
        """
        Verify that views decorated with @ratelimit enforce their custom limit.
        /api/test-limit/ has a custom limit of '3/m', so the 4th request should fail.
        """
        # Call 3 times - Should all succeed
        for i in range(3):
            response = self.client.get('/api/test-limit/')
            self.assertEqual(response.status_code, StatusCodes.OK, f"Request {i+1} failed unexpectedly")
            
        # 4th request - Should fail
        response4 = self.client.get('/api/test-limit/')
        self.assertEqual(response4.status_code, StatusCodes.TOO_MANY_REQUESTS)
        
        data = response4.json()
        self.assertFalse(data['success'])
        self.assertIn("Limit exceeded", data['errors']['rate_limit'])

    def test_exempt_from_rate_limiting(self):
        """
        Verify that views decorated with @exempt_from_rate_limit bypass rate limits entirely.
        """
        # Call 5 times (exceeding both default 2/m and custom 3/m limits) - Should all succeed
        for i in range(5):
            response = self.client.get('/api/test-exempt/')
            self.assertEqual(response.status_code, StatusCodes.OK)

    def test_client_ip_isolation(self):
        """
        Verify that rate limits are isolated by client IP address.
        """
        # client1 makes 2 requests (saturates limit)
        response1 = self.client.get('/api/test/', HTTP_X_FORWARDED_FOR='192.168.1.1')
        response2 = self.client.get('/api/test/', HTTP_X_FORWARDED_FOR='192.168.1.1')
        self.assertEqual(response1.status_code, StatusCodes.OK)
        self.assertEqual(response2.status_code, StatusCodes.OK)
        
        # client1's 3rd request should fail
        response3 = self.client.get('/api/test/', HTTP_X_FORWARDED_FOR='192.168.1.1')
        self.assertEqual(response3.status_code, StatusCodes.TOO_MANY_REQUESTS)
        
        # client2 (different IP) makes a request - Should succeed (isolated limit)
        response4 = self.client.get('/api/test/', HTTP_X_FORWARDED_FOR='192.168.1.2')
        self.assertEqual(response4.status_code, StatusCodes.OK)


class CustomErrorHandlerTests(TestCase):
    def test_handler404_unregistered_url(self):
        """
        Verify that hitting an unregistered URL returns our custom JSON 404 response.
        """
        response = self.client.get('/api/invalid-route-does-not-exist/')
        self.assertEqual(response.status_code, StatusCodes.NOT_FOUND)
        data = response.json()
        self.assertFalse(data['success'])
        self.assertEqual(data['message'], "The requested API endpoint does not exist.")
        self.assertEqual(data['errors']['route'], "Invalid path or URL route.")
