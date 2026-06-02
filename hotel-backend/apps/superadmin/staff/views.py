from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import JSONParser, MultiPartParser, FormParser
from core.response.api_response import success_response, error_response
from core.services.statuscodes import StatusCodes
from core.middleware.jwt_auth import superadmin_required
from .services import StaffService
from .serializers import StaffSerializer
from .models import Staff


# =====================================================================
# SUPER ADMIN ONLY: GET All Staff Listing
# =====================================================================
@superadmin_required
def get_staff_list(request):
    """
    Retrieves the complete list of staff agents, supporting searching
    and category filtering. Restricted strictly to Super Admins.
    """
    try:
        filters = {
            'search': request.GET.get('search'),
            'dept': request.GET.get('dept'),
            'status': request.GET.get('status'),
            'shiftId': request.GET.get('shiftId'),
            'duty': request.GET.get('duty')
        }
        staff_list = StaffService.get_all_staff(filters)
        return success_response(
            message="Staff directory fetched successfully",
            data=staff_list,
            status_code=StatusCodes.OK
        )
    except Exception as e:
        return error_response(
            message="Failed to fetch staff directory.",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )


# =====================================================================
# SUPER ADMIN ONLY: POST Onboard Staff Agent
# =====================================================================
@superadmin_required
def onboard_staff_agent(request):
    """
    Validates payload and registers a new custom staff record.
    Restricted strictly to Super Admins.
    """
    try:
        data = request.data
        
        # Validates payload using StaffSerializer for standard constraints
        serializer = StaffSerializer(data=data)
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

        new_member = StaffService.create_staff(data=serializer.validated_data, files=request.FILES)
        
        return success_response(
            message="Staff agent successfully onboarded!",
            data=new_member,
            status_code=StatusCodes.CREATED
        )
        
    except ValueError as ve:
        return error_response(
            message=str(ve),
            errors={"validation": str(ve)},
            status_code=StatusCodes.BAD_REQUEST
        )
    except Exception as e:
        import traceback
        print(traceback.format_exc())
        return error_response(
            message="An unexpected error occurred during staff onboarding.",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )


# =====================================================================
# ROUTER: GET (List) & POST (Create)
# =====================================================================
@api_view(['GET', 'POST'])
@parser_classes([JSONParser, MultiPartParser, FormParser])
def staff_list_create(request):
    """
    Routes GET requests to list all staff and POST requests to onboard new staff.
    Both methods are guarded via @superadmin_required inside their handler methods.
    """
    if request.method == 'GET':
        return get_staff_list(request)
    elif request.method == 'POST':
        return onboard_staff_agent(request)


# =====================================================================
# SUPER ADMIN ONLY: PUT Update Staff Details
# =====================================================================
@superadmin_required
def update_staff_agent(request, staff_id):
    """
    Validates partial payload and updates staff attributes for specified ID.
    Restricted strictly to Super Admins.
    """
    try:
        data = request.data

        try:
            member_instance = Staff.objects.get(id=staff_id.strip())
        except Staff.DoesNotExist:
            return error_response(
                message=f"Staff agent {staff_id} does not exist.",
                errors={"not_found": "Staff missing"},
                status_code=StatusCodes.NOT_FOUND
            )

        # Validates payload using StaffSerializer in partial mode
        serializer = StaffSerializer(member_instance, data=data, partial=True)
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

        updated_member = StaffService.update_staff(staff_id=staff_id, data=serializer.validated_data, files=request.FILES)
        
        return success_response(
            message="Staff profile successfully updated.",
            data=updated_member,
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
            message="An unexpected error occurred during profile modification.",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )


# =====================================================================
# SUPER ADMIN ONLY: DELETE Offboard Staff Agent
# =====================================================================
@superadmin_required
def delete_staff_agent(request, staff_id):
    """
    Deletes (offboards) the specified staff record from the system.
    Restricted strictly to Super Admins.
    """
    try:
        deleted = StaffService.delete_staff(staff_id)
        if not deleted:
            return error_response(
                message=f"Staff agent {staff_id} does not exist.",
                errors={"not_found": "Staff missing"},
                status_code=StatusCodes.NOT_FOUND
            )
        return success_response(
            message="Staff member successfully retired and deleted.",
            data={},
            status_code=StatusCodes.OK
        )
    except Exception as e:
        return error_response(
            message="An unexpected error occurred during staff deletion.",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )


# =====================================================================
# ROUTER: PUT (Update) & DELETE (Delete)
# =====================================================================
@api_view(['PUT', 'DELETE'])
@parser_classes([JSONParser, MultiPartParser, FormParser])
def staff_detail_update_delete(request, staff_id):
    """
    Routes PUT (Edit) and DELETE (Remove) requests for a single staff ID.
    Both methods are guarded via @superadmin_required inside their handler methods.
    """
    if request.method == 'PUT':
        return update_staff_agent(request, staff_id)
    elif request.method == 'DELETE':
        return delete_staff_agent(request, staff_id)
