from django.urls import path
from .views import health_check, test_check, mysql_check

urlpatterns = [
    path('health/', health_check),
    path('test/',test_check),
    path('db-test/',mysql_check)
]

