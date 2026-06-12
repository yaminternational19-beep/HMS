from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Sum
from apps.frontoffice.booking.models import Booking, BookingPayment, BookingTransaction
from apps.superadmin.staff.models import Staff
from apps.superadmin.rooms.models import Rooms
from apps.superadmin.dashboard.models import SuperadminAlert
from django.utils import timezone

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

        # 3. Staff on Shift (Force Railway Redeploy)
        total_staff = Staff.objects.count()
        staff_on_shift = Staff.objects.filter(is_checked_in=True).count()

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

        # 6. Urgent Alerts
        alerts_qs = SuperadminAlert.objects.all().order_by('-created_at')[:5]
        urgent_alerts = []
        for alert in alerts_qs:
            # Generate a "time ago" string based on created_at
            now = timezone.now()
            diff = now - alert.created_at
            if diff.days > 0:
                time_str = f"{diff.days} days ago"
            elif diff.seconds >= 3600:
                time_str = f"{diff.seconds // 3600} hours ago"
            elif diff.seconds >= 60:
                time_str = f"{diff.seconds // 60} mins ago"
            else:
                time_str = "Just now"

            urgent_alerts.append({
                "id": alert.id,
                "title": alert.title,
                "desc": alert.desc,
                "time": time_str,
                "type": alert.type,
            })

        return Response({
            "status": "success",
            "data": {
                "stats": stats,
                "recentActivity": recent_activity,
                "urgentAlerts": urgent_alerts
            }
        }, status=status.HTTP_200_OK)
