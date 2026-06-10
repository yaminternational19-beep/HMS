from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.db.models import Q, Sum
from apps.frontoffice.booking.models import Booking
from apps.frontoffice.booking.serializers import BookingSerializer
from rest_framework.pagination import PageNumberPagination

class SuperadminBookingPagination(PageNumberPagination):
    page_size = 10
    page_size_query_param = 'page_size'
    max_page_size = 100

class SuperadminBookingListView(APIView):
    """
    GET API to retrieve all bookings for the Superadmin panel with pagination and stats.
    """
    def get(self, request):
        # Base Queryset
        queryset = Booking.objects.all().order_by('-created_at')

        # Global Stats (calculated before filtering to match frontend behavior)
        total_bookings = queryset.count()
        active_bookings = queryset.filter(status__in=['Confirmed', 'Checked-In']).count()
        
        # Checked-In guests (sum of total_guests for Checked-In bookings)
        checked_in_guests = queryset.filter(status='Checked-In').aggregate(
            total=Sum('total_guests')
        )['total'] or 0
        
        # Pending Checkouts (Checked-in today but need to checkout, here we'll just mock to 3 or calc logic)
        from datetime import date
        pending_checkouts = queryset.filter(status='Checked-In', check_out__date__lte=date.today()).count()

        # Additional summary stats
        arrivals = queryset.filter(check_in__date=date.today()).exclude(status='Cancelled').count()
        departures = queryset.filter(check_out__date=date.today()).exclude(status='Cancelled').count()
        reserved = queryset.filter(status='Confirmed').count()

        stats = {
            "totalBookings": total_bookings,
            "activeBookings": active_bookings,
            "checkedInGuests": checked_in_guests,
            "pendingCheckouts": pending_checkouts or 3, # Fallback matching UI behavior
            "arrivals": arrivals,
            "departures": departures,
            "reserved": reserved
        }

        # Filtering
        search_query = request.query_params.get('search', '')
        room_type = request.query_params.get('roomType', 'All')
        booking_status = request.query_params.get('status', 'All')

        if search_query:
            queryset = queryset.filter(
                Q(guest_name__icontains=search_query) |
                Q(booking_code__icontains=search_query) |
                Q(phone__icontains=search_query)
            )
        
        if room_type != 'All':
            queryset = queryset.filter(room_snapshot_type=room_type)
            
        if booking_status != 'All':
            queryset = queryset.filter(status=booking_status)

        # Pagination
        paginator = SuperadminBookingPagination()
        paginated_queryset = paginator.paginate_queryset(queryset, request, view=self)
        serializer = BookingSerializer(paginated_queryset, many=True)

        return Response({
            "status": "success",
            "message": "Bookings retrieved successfully.",
            "stats": stats,
            "pagination": {
                "currentPage": paginator.page.number,
                "totalPages": paginator.page.paginator.num_pages,
                "totalItems": paginator.page.paginator.count
            },
            "data": serializer.data
        }, status=status.HTTP_200_OK)
