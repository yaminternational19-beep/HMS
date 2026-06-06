from rest_framework.decorators import api_view
from core.response.api_response import success_response, error_response
from core.services.statuscodes import StatusCodes
from .services import BookingService
from .serializers import BookingSerializer

# =====================================================================
# Authorization Helpers
# =====================================================================
def get_auth_employee(request):
    """Returns authenticated staff employee or None."""
    return getattr(request, 'employee', None)

def get_auth_superadmin(request):
    """Returns authenticated super admin if role is correct, else None."""
    user = getattr(request, 'staff', None)
    if user and getattr(user, 'role', '') == 'super_admin':
        return user
    return None

def check_read_permission(request):
    """Allows staff employees and super admins to view records."""
    return bool(get_auth_employee(request) or get_auth_superadmin(request))

def check_write_permission(request):
    """Allows only staff employees to create or edit records."""
    return bool(get_auth_employee(request))


# =====================================================================
# API 1 & 2: Route handler for GET (List) and POST (Create)
# =====================================================================
@api_view(['GET', 'POST'])
def booking_list_create(request):
    """
    GET: Retrieve all bookings (Staff & Super Admin allowed).
    POST: Create a new booking (Staff ONLY allowed, Super Admin forbidden).
    """
    # ----------------------------------------------------
    # GET: List bookings
    # ----------------------------------------------------
    if request.method == 'GET':
        if not check_read_permission(request):
            return error_response(
                message="Unauthorized. Please log in as a staff member or administrator.",
                errors={"auth": "Authentication token missing or invalid"},
                status_code=StatusCodes.UNAUTHORIZED
            )
            
        try:
            filters = {
                'search': request.GET.get('search'),
                'status': request.GET.get('status'),
                'roomType': request.GET.get('roomType'),
            }
            bookings = BookingService.get_all_bookings(filters)
            return success_response(
                message="Bookings retrieved successfully.",
                data=bookings,
                status_code=StatusCodes.OK
            )
        except Exception as e:
            return error_response(
                message="Failed to retrieve bookings.",
                errors={"server": str(e)},
                status_code=StatusCodes.INTERNAL_SERVER_ERROR
            )

    # ----------------------------------------------------
    # POST: Create a check-in booking
    # ----------------------------------------------------
    elif request.method == 'POST':
        # Super Admin is forbidden from adding bookings
        if get_auth_superadmin(request):
            return error_response(
                message="Forbidden. Super Administrators are not authorized to create booking records.",
                errors={"auth": "Super Admin write operations forbidden"},
                status_code=StatusCodes.FORBIDDEN
            )
            
        employee = get_auth_employee(request)
        if not employee:
            return error_response(
                message="Unauthorized. Logged-in frontoffice staff credentials are required.",
                errors={"auth": "Authentication token missing or invalid"},
                status_code=StatusCodes.UNAUTHORIZED
            )

        try:
            serializer = BookingSerializer(data=request.data)
            if not serializer.is_valid():
                error_messages = []
                for field, errs in serializer.errors.items():
                    detail = errs[0] if isinstance(errs, list) else str(errs)
                    error_messages.append(f"{field}: {detail}")
                clear_message = "Validation failed: " + "; ".join(error_messages)
                return error_response(
                    message=clear_message,
                    errors=serializer.errors,
                    status_code=StatusCodes.BAD_REQUEST
                )

            new_booking = BookingService.create_booking(serializer.validated_data, employee)
            return success_response(
                message="Booking registered successfully.",
                data=new_booking,
                status_code=StatusCodes.CREATED
            )
        except ValueError as ve:
            return error_response(
                message=str(ve),
                errors={"validation": str(ve)},
                status_code=StatusCodes.BAD_REQUEST
            )
        except Exception as e:
            return error_response(
                message="An unexpected error occurred during booking creation.",
                errors={"server": str(e)},
                status_code=StatusCodes.INTERNAL_SERVER_ERROR
            )


# =====================================================================
# API 3 & 4: Route handler for GET (Detail) and PUT (Update)
# =====================================================================
@api_view(['GET', 'PUT'])
def booking_detail_update(request, booking_code):
    """
    GET: Retrieve booking details (Staff & Super Admin allowed).
    PUT: Update a booking (Staff ONLY allowed, Super Admin forbidden).
    """
    # ----------------------------------------------------
    # GET: Retrieve detail
    # ----------------------------------------------------
    if request.method == 'GET':
        if not check_read_permission(request):
            return error_response(
                message="Unauthorized. Please log in as a staff member or administrator.",
                errors={"auth": "Authentication token missing or invalid"},
                status_code=StatusCodes.UNAUTHORIZED
            )

        try:
            booking = BookingService.get_booking_by_code(booking_code)
            if not booking:
                return error_response(
                    message=f"Booking '{booking_code}' was not found.",
                    errors={"not_found": "Booking missing"},
                    status_code=StatusCodes.NOT_FOUND
                )
            return success_response(
                message="Booking detail retrieved successfully.",
                data=booking,
                status_code=StatusCodes.OK
            )
        except Exception as e:
            return error_response(
                message="Failed to retrieve booking details.",
                errors={"server": str(e)},
                status_code=StatusCodes.INTERNAL_SERVER_ERROR
            )

    # ----------------------------------------------------
    # PUT: Update a booking
    # ----------------------------------------------------
    elif request.method == 'PUT':
        # Super Admin is forbidden from editing bookings
        if get_auth_superadmin(request):
            return error_response(
                message="Forbidden. Super Administrators are not authorized to modify booking records.",
                errors={"auth": "Super Admin write operations forbidden"},
                status_code=StatusCodes.FORBIDDEN
            )
            
        employee = get_auth_employee(request)
        if not employee:
            return error_response(
                message="Unauthorized. Logged-in frontoffice staff credentials are required.",
                errors={"auth": "Authentication token missing or invalid"},
                status_code=StatusCodes.UNAUTHORIZED
            )

        try:
            # 1. Fetch current instance
            from .models import Booking as BookingModel
            try:
                booking_instance = BookingModel.objects.get(booking_code=booking_code.strip())
            except BookingModel.DoesNotExist:
                return error_response(
                    message=f"Booking '{booking_code}' was not found.",
                    errors={"not_found": "Booking missing"},
                    status_code=StatusCodes.NOT_FOUND
                )

            # 2. Serialize and validate partial updates
            serializer = BookingSerializer(booking_instance, data=request.data, partial=True)
            if not serializer.is_valid():
                error_messages = []
                for field, errs in serializer.errors.items():
                    detail = errs[0] if isinstance(errs, list) else str(errs)
                    error_messages.append(f"{field}: {detail}")
                clear_message = "Validation failed: " + "; ".join(error_messages)
                return error_response(
                    message=clear_message,
                    errors=serializer.errors,
                    status_code=StatusCodes.BAD_REQUEST
                )

            # 3. Update records
            updated_booking = BookingService.update_booking(
                booking_code=booking_code,
                data=serializer.validated_data,
                actor_employee=employee
            )
            
            return success_response(
                message="Booking updated successfully.",
                data=updated_booking,
                status_code=StatusCodes.OK
            )
        except ValueError as ve:
            return error_response(
                message=str(ve),
                errors={"validation": str(ve)},
                status_code=StatusCodes.BAD_REQUEST
            )
        except Exception as e:
            return error_response(
                message="An unexpected error occurred during booking modification.",
                errors={"server": str(e)},
                status_code=StatusCodes.INTERNAL_SERVER_ERROR
            )
