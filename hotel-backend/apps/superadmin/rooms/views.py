from rest_framework.decorators import api_view, parser_classes
from rest_framework.parsers import MultiPartParser, FormParser, JSONParser
from core.response.api_response import success_response, error_response
from core.services.statuscodes import StatusCodes
from core.middleware.jwt_auth import jwt_required, superadmin_required
from .services import RoomService
from .serializers import RoomsSerializer
from .models import Rooms


# =====================================================================
# PUBLIC/STAFF: GET All Rooms Handler
# =====================================================================
@jwt_required
def get_rooms_list(request):
    try:
        filters = {
            'search': request.GET.get('search'),
            'status': request.GET.get('status'),
            'type': request.GET.get('type'),
            'floor': request.GET.get('floor')
        }
        rooms_list = RoomService.get_all_rooms(filters)
        return success_response(
            message="Rooms fetched successfully",
            data=rooms_list,
            status_code=StatusCodes.OK
        )
    except Exception as e:
        return error_response(
            message="Failed to fetch rooms.",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )

# =====================================================================
# SUPER ADMIN ONLY: POST Create Room Handler
# =====================================================================
@superadmin_required
def create_room_record(request):
    try:
        data = request.data
        
        # 1. Payload validation using RoomsSerializer
        serializer = RoomsSerializer(data=data, context={'request': request})
        if not serializer.is_valid():
            # Build an explicit, ultra-clear detailed error description
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



        actor_role = getattr(request.staff, 'role', 'super_admin')
        actor_id = getattr(request.staff, 'id', None)
        
        new_room = RoomService.create_room(
            data=data,
            files=request.FILES,
            actor_role=actor_role,
            actor_id=actor_id
        )
        
        return success_response(
            message="Room registered successfully",
            data=new_room,
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
            message="An unexpected error occurred during room registration.",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )

# =====================================================================
# THE SINGLE ROUTER: GET (List) & POST (Create)
# =====================================================================
@api_view(['GET', 'POST'])
@parser_classes([JSONParser, MultiPartParser, FormParser])
def room_list_create(request):
    """
    Routes GET requests to general staff room listing (guarded by general auth),
    and POST requests to Super Admin room creation (guarded by Super Admin role checks).
    """
    if request.method == 'GET':
        return get_rooms_list(request)
    elif request.method == 'POST':
        return create_room_record(request)


# =====================================================================
# THE DETAIL/UPDATE/DELETE ROUTERS
# =====================================================================
@superadmin_required
def update_room_record(request, room_number):
    try:
        data = request.data

        try:
            room_instance = Rooms.objects.get(room_number=room_number.strip())
        except Rooms.DoesNotExist:
            return error_response(
                message=f"Room {room_number} does not exist.",
                errors={"not_found": "Room missing"},
                status_code=StatusCodes.NOT_FOUND
            )

        # 1. Payload validation using RoomsSerializer in partial mode
        serializer = RoomsSerializer(room_instance, data=data, partial=True, context={'request': request})
        if not serializer.is_valid():
            # Build an explicit, ultra-clear detailed error description
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



        actor_role = getattr(request.staff, 'role', 'super_admin')
        actor_id = getattr(request.staff, 'id', None)
        
        updated_room = RoomService.update_room(
            room_number=room_number,
            data=data,
            files=request.FILES,
            actor_role=actor_role,
            actor_id=actor_id
        )
        
        if not updated_room:
            return error_response(
                message=f"Room {room_number} does not exist.",
                errors={"not_found": "Room missing"},
                status_code=StatusCodes.NOT_FOUND
            )
            
        return success_response(
            message="Room updated successfully",
            data=updated_room,
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
            message="An unexpected error occurred during room modification.",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )

@superadmin_required
def delete_room_record(request, room_number):
    try:
        deleted = RoomService.delete_room(room_number)
        if not deleted:
            return error_response(
                message=f"Room {room_number} does not exist.",
                errors={"not_found": "Room missing"},
                status_code=StatusCodes.NOT_FOUND
            )
        return success_response(
            message="Room deleted successfully",
            data={},
            status_code=StatusCodes.OK
        )
    except Exception as e:
        return error_response(
            message="An unexpected error occurred during room deletion.",
            errors={"server": str(e)},
            status_code=StatusCodes.INTERNAL_SERVER_ERROR
        )

# =====================================================================
# THE SINGLE ROUTER: PUT (Update) & DELETE (Delete)
# =====================================================================
@api_view(['PUT', 'DELETE'])
@parser_classes([JSONParser, MultiPartParser, FormParser])
def room_detail_update_delete(request, room_number):
    """
    Routes PUT (Edit) and DELETE (Remove) requests strictly to Super Admin role.
    """
    if request.method == 'PUT':
        return update_room_record(request, room_number)
    elif request.method == 'DELETE':
        return delete_room_record(request, room_number)
