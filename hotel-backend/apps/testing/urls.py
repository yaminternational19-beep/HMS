from django.urls import path
from .views import health_check, test_check, mysql_check, custom_limit_check, exempt_check, cloudinary_check

urlpatterns = [
    path('health/', health_check),
    path('test/',test_check),
    path('db-test/',mysql_check),
    path('test-limit/', custom_limit_check),
    path('test-exempt/', exempt_check),
    path('cloudinary-test/', cloudinary_check),
]

