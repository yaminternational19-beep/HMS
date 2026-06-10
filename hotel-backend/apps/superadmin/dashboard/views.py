from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from apps.frontoffice.booking.models import Booking, BookingPayment, BookingTransaction
from apps.superadmin.staff.models import Staff
from apps.superadmin.rooms.models import Rooms

class DashboardAPIView(APIView):
    """
    GET API to retrieve aggregated metrics for the Superadmin Dashboard.
    """
    def get(self, request):
        # 1. Total Revenue (Sum of all final_amounts in BookingPayment)
        total_revenue = BookingPayment.objects.aggregate(total=Sum('final_amount'))['total'] or 0.0

        # 2. Active Bookings
        active_bookings_count = Booking.objects.filter(status__in=['Confirmed', 'Checked-In']).count()
        scheduled_today = Booking.objects.filter(status='Confirmed').count() # simple heuristic

        # 3. Staff on Shift
        total_staff = Staff.objects.count()
        staff_on_shift = Staff.objects.filter(isCheckedIn=True).count()

        # 4. Average Occupancy (Active Bookings / Total Rooms) * 100
        total_rooms = Rooms.objects.count()
        occupancy_rate = 0
        if total_rooms > 0:
            occupancy_rate = round((active_bookings_count / total_rooms) * 100, 1)

        stats = [
            {
                "label": "Total Revenue",
                "value": f"₹{total_revenue:,.2f}",
                "change": "+14.2% vs last month",
                "trend": "up",
                "type": "revenue"
            },
            {
                "label": "Average Occupancy",
                "value": f"{occupancy_rate}%",
                "change": "+4.1% vs last week",
                "trend": "up",
                "type": "occupancy"
            },
            {
                "label": "Active Bookings",
                "value": f"{active_bookings_count} Active",
                "change": f"{scheduled_today} scheduled today",
                "trend": "up",
                "type": "bookings"
            },
            {
                "label": "Staff on Shift",
                "value": f"{staff_on_shift} / {total_staff} Staff",
                "change": "Departments active",
                "trend": "neutral",
                "type": "staff"
            }
        ]

        # 5. Recent Transactions
        # Fetch last 5 bookings that have payments
        recent_payments = BookingPayment.objects.select_related('booking').order_by('-created_at')[:5]
        recent_activity = []
        for payment in recent_payments:
            booking = payment.booking
            recent_activity.append({
                "id": payment.transaction_id or booking.booking_code,
                "guest": booking.guest_name,
                "room": f"Room {booking.room_snapshot_number} ({booking.room_snapshot_type})",
                "amount": f"₹{payment.final_amount:,.2f}",
                "status": payment.payment_status.lower(),
                "date": payment.created_at.strftime("%b %d, %H:%M")
            })

        # 6. Urgent Alerts (Mocked for now)
        urgent_alerts = [
            {
                "id": 1,
                "title": 'System Optimization',
                "desc": 'Server cache cleared successfully.',
                "time": '10 mins ago',
                "type": 'info',
            },
            {
                "id": 2,
                "title": 'High Occupancy Alert',
                "desc": f'Occupancy is at {occupancy_rate}%. Ensure adequate staff.',
                "time": '1 hour ago',
                "type": 'warning',
            }
        ]

        return Response({
            "status": "success",
            "data": {
                "stats": stats,
                "recentActivity": recent_activity,
                "urgentAlerts": urgent_alerts
            }
        }, status=status.HTTP_200_OK)
