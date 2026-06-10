from django.urls import path
from .views import SuperadminBookingListView

urlpatterns = [
    path('', SuperadminBookingListView.as_view(), name='superadmin-booking-list'),
]
