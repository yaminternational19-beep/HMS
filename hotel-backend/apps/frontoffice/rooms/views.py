from rest_framework.decorators import api_view
from core.response.api_response import success_response, error_response
from core.services.statuscodes import StatusCodes
from .services import FrontOfficeRoomService

# =====================================================================
# Authorization Helpers (Aligned with frontoffice booking views)
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


# =====================================================================
# GET: Room Inventory List and Statistics Dashboard
# =====================================================================
@api_view(['GET'])
def room_list_stats(request):
    """
    Retrieves the list of rooms (applying filters if any) and compiles 
    the overall room inventory statistics (total, available, occupied, maintenance).
    Guarded by general JWT authentication (staff and super admins allowed).
    """
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
            'type': request.GET.get('type'),
            'floor': request.GET.get('floor'),
        }
        
        result = FrontOfficeRoomService.get_rooms_and_stats(filters)
        return success_response(
            message="Room list and stats retrieved successfully.",
            data=result,
            status_code=StatusCodes.OK
        )
    except Exception as e:
        return error_response(
            message="Failed to retrieve room inventory.",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )


# =====================================================================
# PUT: Update Room Status
# =====================================================================
@api_view(['PUT'])
def update_room_status_view(request, room_number):
    """
    Updates the status of a specific room.
    Guarded strictly by frontoffice employee credentials (super admin forbidden).
    """
    # Super admins are forbidden from executing frontoffice status changes
    if get_auth_superadmin(request):
        return error_response(
            message="Forbidden. Super Administrators are not authorized to perform frontoffice status updates.",
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

    new_status = request.data.get('status')
    if not new_status:
        return error_response(
            message="Validation failed: status field is required.",
            errors={"status": "This field is required."},
            status_code=StatusCodes.BAD_REQUEST
        )

    try:
        updated_room = FrontOfficeRoomService.update_room_status(
            room_number=room_number,
            new_status=new_status,
            actor_employee=employee
        )
        return success_response(
            message=f"Room {room_number} status updated successfully.",
            data=updated_room,
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
            message="An unexpected error occurred while updating the room status.",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )
