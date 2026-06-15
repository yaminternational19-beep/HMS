from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser
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
                'page': request.GET.get('page'),
                'limit': request.GET.get('limit'),
            }
            result = BookingService.get_all_bookings(filters)
            return success_response(
                message="Bookings retrieved successfully.",
                data=result,
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


# =====================================================================
# API 5: Route handler to generate receipt/payslip
# =====================================================================
@api_view(['GET'])
def generate_payslip(request, booking_code):
    """
    GET: Generate a structured receipt/payslip for a fully paid booking.
    Allows both staff employees and super admins to view the receipt.
    """
    if not check_read_permission(request):
        return error_response(
            message="Unauthorized. Please log in as a staff member or administrator.",
            errors={"auth": "Authentication token missing or invalid"},
            status_code=StatusCodes.UNAUTHORIZED
        )

    try:
        payslip_data = BookingService.generate_payslip_details(booking_code)
        return success_response(
            message="Payslip generated successfully.",
            data=payslip_data,
            status_code=StatusCodes.OK
        )
    except ValueError as ve:
        error_msg = str(ve)
        status_code = StatusCodes.NOT_FOUND if "does not exist" in error_msg else StatusCodes.BAD_REQUEST
        return error_response(
            message=error_msg,
            errors={"validation": error_msg},
            status_code=status_code
        )
    except Exception as e:
        return error_response(
            message="Failed to generate payslip.",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )


@api_view(['POST'])
@parser_classes([MultiPartParser, FormParser])
def upload_document(request):
    """
    POST: Upload a file (ID Proof) and return the public URL path.
    """
    if not check_write_permission(request):
        return error_response(
            message="Unauthorized. Logged-in staff credentials are required.",
            errors={"auth": "Authentication token missing or invalid"},
            status_code=StatusCodes.UNAUTHORIZED
        )
        
    uploaded_file = request.FILES.get('file')
    if not uploaded_file:
        return error_response(
            message="No file was provided.",
            errors={"file": "Missing file"},
            status_code=StatusCodes.BAD_REQUEST
        )

    try:
        from core.services.upload_service import UploadService
        # Upload file to 'bookings/{booking_code}' subfolder
        booking_code = request.data.get('booking_code', 'general').strip()
        subfolder_name = f'bookings/{booking_code}' if booking_code else 'bookings/general'
        
        path = UploadService.upload_single_file(uploaded_file, subfolder=subfolder_name)
        
        import os
        backend_url = os.environ.get('BACKEND_URL', 'http://localhost:8000')
        full_url = path if path.startswith('http') else f"{backend_url}{path}"
        return success_response(
            message="File uploaded successfully.",
            data={"url": full_url, "name": uploaded_file.name},
            status_code=StatusCodes.CREATED
        )
    except Exception as e:
        return error_response(
            message="Failed to upload file.",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )


@api_view(['GET'])
def invoice_list(request):
    """
    GET: Retrieve all invoices mapped from bookings (Staff & Super Admin allowed).
    """
    if not check_read_permission(request):
        return error_response(
            message="Unauthorized. Please log in as a staff member or administrator.",
            errors={"auth": "Authentication token missing or invalid"},
            status_code=StatusCodes.UNAUTHORIZED
        )
        
    try:
        from .models import Booking, BookingPayment
        from zoneinfo import ZoneInfo
        
        bookings = Booking.objects.select_related('room').all().order_by('-created_at')
        invoices = []
        
        for booking in bookings:
            try:
                payment = booking.payment_details
                final_amount = float(payment.final_amount)
                advance_paid = float(payment.advance_paid)
                room_rent = float(payment.room_rent)
                extra_charges = float(payment.extra_charges)
                discount = float(payment.discount)
                gst = float(payment.gst)
                payment_status = payment.payment_status
                payment_method = payment.payment_method
                invoice_number = payment.invoice_number
                paid_date = booking.checked_out_at.astimezone(ZoneInfo('Asia/Kolkata')).strftime('%Y-%m-%d') if booking.checked_out_at else None
            except BookingPayment.DoesNotExist:
                raw_details = booking.raw_data or {}
                pay_raw = raw_details.get('paymentDetails', {}) or {}
                final_amount = float(pay_raw.get('finalAmount') or 0.00)
                advance_paid = float(pay_raw.get('advancePaid') or 0.00)
                room_rent = float(pay_raw.get('roomRent') or 0.00)
                extra_charges = float(pay_raw.get('extraCharges') or 0.00)
                discount = float(pay_raw.get('discount') or 0.00)
                gst = float(pay_raw.get('gst') or 0.00)
                payment_status = pay_raw.get('paymentStatus') or 'Pending'
                payment_method = pay_raw.get('paymentMethod') or 'Cash'
                invoice_number = pay_raw.get('invoiceNumber') or ''
                paid_date = None

            check_in_str = booking.check_in.astimezone(ZoneInfo('Asia/Kolkata')).strftime('%Y-%m-%d') if booking.check_in else ''
            check_out_str = booking.check_out.astimezone(ZoneInfo('Asia/Kolkata')).strftime('%Y-%m-%d') if booking.check_out else ''
            issued_date_str = booking.created_at.astimezone(ZoneInfo('Asia/Kolkata')).strftime('%Y-%m-%d') if booking.created_at else check_in_str

            nights = 0
            if booking.check_in and booking.check_out:
                nights = (booking.check_out - booking.check_in).days
                if nights <= 0:
                    nights = 1

            if booking.status == 'Cancelled':
                inv_status = 'Cancelled'
            elif payment_status == 'Paid':
                inv_status = 'Paid'
            elif payment_status == 'Partial':
                inv_status = 'Partial Payment'
            elif booking.status == 'Checked-Out' and advance_paid < final_amount:
                inv_status = 'Overdue'
            else:
                inv_status = 'Pending'

            line_items = [
                {
                    "description": f"Room Rent ({nights} night{'s' if nights > 1 else ''} × ₹{booking.room.price if booking.room else room_rent:.2f})",
                    "amount": room_rent
                }
            ]
            if extra_charges > 0:
                line_items.append({
                    "description": "Room Service & Extras",
                    "amount": extra_charges
                })

            invoice_id = invoice_number if invoice_number else f"INV-{booking.booking_code}"

            invoices.append({
                "id": invoice_id,
                "bookingId": booking.booking_code,
                "guestName": booking.guest_name,
                "phone": booking.phone,
                "roomNumber": booking.room_snapshot_number,
                "roomType": booking.room_snapshot_type,
                "checkIn": check_in_str,
                "checkOut": check_out_str,
                "nights": nights,
                "lineItems": line_items,
                "subTotal": room_rent + extra_charges,
                "discount": discount,
                "gst": gst,
                "totalAmount": final_amount,
                "paidAmount": advance_paid,
                "balanceDue": max(0.0, final_amount - advance_paid),
                "status": inv_status,
                "paymentMethod": payment_method,
                "issuedDate": issued_date_str,
                "paidDate": paid_date,
                "raw": booking.raw_data or {}
            })

        return success_response(
            message="Invoices retrieved successfully.",
            data=invoices,
            status_code=StatusCodes.OK
        )
    except Exception as e:
        return error_response(
            message="Failed to retrieve invoices list.",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )
