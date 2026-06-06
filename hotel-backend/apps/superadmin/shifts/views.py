from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import JSONParser
from core.response.api_response import success_response, error_response
from core.services.statuscodes import StatusCodes
from core.middleware.jwt_auth import superadmin_required
from .services import ShiftService
from .serializers import ShiftsSerializer
from .models import Shifts


# =====================================================================
# SUPER ADMIN ONLY: GET All Shifts Handler
# =====================================================================
@superadmin_required
def get_shifts_list(request):
    """
    Retrieves the complete list of operational shifts, supporting query filtering.
    Restricted strictly to Super Admins.
    """
    try:
        filters = {
            'search': request.GET.get('search')
        }
        shifts_list = ShiftService.get_all_shifts(filters)
        return success_response(
            message="Shifts fetched successfully",
            data=shifts_list,
            status_code=StatusCodes.OK
        )
    except Exception as e:
        return error_response(
            message="Failed to fetch shifts.",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )


# =====================================================================
# SUPER ADMIN ONLY: POST Create Shift Handler
# =====================================================================
@superadmin_required
def create_shift_record(request):
    """
    Validates payload and registers a new custom operational shift.
    Restricted strictly to Super Admins.
    """
    try:
        data = request.data
        
        # Payload validation using ShiftsSerializer
        serializer = ShiftsSerializer(data=data)
        if not serializer.is_valid():
            error_msgs = []
            for field, errs in serializer.errors.items():
                detail = errs[0] if isinstance(errs, list) else str(errs)
                error_msgs.append(f"{field}: {detail}")
            clear_message = "Validation failed: " + "; ".join(error_msgs)
            
            return error_response(
                message=clear_message,
                errors=serializer.errors,
                status_code=StatusCodes.BAD_REQUEST
            )

        new_shift = ShiftService.create_shift(data=data)
        
        return success_response(
            message="Custom shift successfully created!",
            data=new_shift,
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
            message="An unexpected error occurred during shift creation.",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )


# =====================================================================
# THE SINGLE ROUTER: GET (List) & POST (Create)
# =====================================================================
@api_view(['GET', 'POST'])
@parser_classes([JSONParser])
@superadmin_required
def shift_list_create(request):
    """
    Routes GET requests to list all shifts and POST requests to define custom shifts.
    Guarded via @superadmin_required.
    """
    if request.method == 'GET':
        return get_shifts_list(request)
    elif request.method == 'POST':
        return create_shift_record(request) 


# =====================================================================
# SUPER ADMIN ONLY: PUT Update Shift Handler
# =====================================================================
@superadmin_required
def update_shift_record(request, shift_id):
    """
    Validates partial payload and updates shift attributes for specified shift ID.
    Restricted strictly to Super Admins.
    """
    try:
        data = request.data

        try:
            shift_instance = Shifts.objects.get(id=shift_id.strip())
        except Shifts.DoesNotExist:
            return error_response(
                message=f"Shift {shift_id} does not exist.",
                errors={"not_found": "Shift missing"},
                status_code=StatusCodes.NOT_FOUND
            )

        # Payload validation using ShiftsSerializer in partial mode
        serializer = ShiftsSerializer(shift_instance, data=data, partial=True)
        if not serializer.is_valid():
            error_msgs = []
            for field, errs in serializer.errors.items():
                detail = errs[0] if isinstance(errs, list) else str(errs)
                error_msgs.append(f"{field}: {detail}")
            clear_message = "Validation failed: " + "; ".join(error_msgs)
            
            return error_response(
                message=clear_message,
                errors=serializer.errors,
                status_code=StatusCodes.BAD_REQUEST
            )

        updated_shift = ShiftService.update_shift(shift_id=shift_id, data=data)
        
        return success_response(
            message="Shift successfully updated.",
            data=updated_shift,
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
            message="An unexpected error occurred during shift modification.",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )


# =====================================================================
# SUPER ADMIN ONLY: DELETE Shift Handler
# =====================================================================
@superadmin_required
def delete_shift_record(request, shift_id):
    """
    Deletes the specified shift from the system.
    Restricted strictly to Super Admins.
    """
    try:
        deleted = ShiftService.delete_shift(shift_id)
        if not deleted:
            return error_response(
                message=f"Shift {shift_id} does not exist.",
                errors={"not_found": "Shift missing"},
                status_code=StatusCodes.NOT_FOUND
            )
        return success_response(
            message="Shift successfully retired and deleted.",
            data={},
            status_code=StatusCodes.OK
        )
    except Exception as e:
        return error_response(
            message="An unexpected error occurred during shift deletion.",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )


# =====================================================================
# THE DETAIL ROUTER: PUT (Update) & DELETE (Delete)
# =====================================================================
@api_view(['PUT', 'DELETE'])
@parser_classes([JSONParser])
@superadmin_required
def shift_detail_update_delete(request, shift_id):
    """
    Routes PUT (Edit) and DELETE (Remove) requests for a single shift ID.
    Guarded via @superadmin_required.
    """
    if request.method == 'PUT':
        return update_shift_record(request, shift_id)
    elif request.method == 'DELETE':
        return delete_shift_record(request, shift_id)
