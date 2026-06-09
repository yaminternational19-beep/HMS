from zoneinfo import ZoneInfo
from django.db.models import Q
from apps.superadmin.rooms.models import Rooms
from apps.frontoffice.booking.models import Booking

# Map backend DB status to React frontend status format
STATUS_MAP_DB_TO_FE = {
    'available': 'Available',
    'occupied': 'Occupied',
    'reserved': 'Reserved',
    'maintenance': 'Under Maintenance',
    'under maintenance': 'Under Maintenance',
    'cleaning': 'Needs Cleaning',
    'needs cleaning': 'Needs Cleaning',
}

# Map incoming frontend status format to backend DB status format
STATUS_MAP_FE_TO_DB = {
    'Available': 'available',
    'Occupied': 'occupied',
    'Reserved': 'reserved',
    'Under Maintenance': 'maintenance',
    'Needs Cleaning': 'cleaning',
    # Support lowercase / fallback mappings
    'available': 'available',
    'occupied': 'occupied',
    'reserved': 'reserved',
    'maintenance': 'maintenance',
    'under maintenance': 'maintenance',
    'cleaning': 'cleaning',
    'needs cleaning': 'cleaning',
}

class FrontOfficeRoomService:
    """
    Service Layer handling business logic, status serialization/mapping,
    statistics aggregation, and room status updates for the Front Office panel.
    """

    @staticmethod
    def serialize_room_frontoffice(room: Rooms, active_bookings_dict: dict = None) -> dict:
        """
        Serializes a room instance to the format required by the Front Office React app.
        Maps the status field to matching case-sensitive frontend strings and embeds
        dynamic guest name and cleaning staff details.
        """
        if not room:
            return {}

        db_status = room.status.lower() if room.status else 'available'
        fe_status = STATUS_MAP_DB_TO_FE.get(db_status, db_status.title())

        # Format upload image paths to absolute URLs
        formatted_images = [
            f"http://localhost:8000{img}" if isinstance(img, str) and img.startswith('/uploads/') else img
            for img in (room.images or [])
        ]

        # Extract dynamic guest name if room is occupied
        guest_name = None
        if fe_status == 'Occupied':
            if active_bookings_dict and room.room_number in active_bookings_dict:
                guest_name = active_bookings_dict[room.room_number]
            else:
                try:
                    # Fallback database query if dictionary is not pre-populated
                    active_booking = Booking.objects.filter(
                        room_snapshot_number=room.room_number, 
                        status='Checked-In'
                    ).first()
                    guest_name = active_booking.guest_name if active_booking else 'In-House Guest'
                except Exception:
                    guest_name = 'In-House Guest'

        # Set default cleaning staff fallback if room needs cleaning
        cleaning_staff = 'Maria S.' if fe_status == 'Needs Cleaning' else None

        return {
            "id": f"RM-{room.room_number}", # Matches frontend mock-data ID format 'RM-101'
            "roomNumber": room.room_number,
            "type": room.room_type,
            "floor": room.floor,
            "status": fe_status,
            "price": float(room.price),
            "capacity": int(room.capacity),
            "bedType": room.bed_type,
            "amenities": room.amenities or [],
            "images": formatted_images,
            "description": room.description or '',
            "lastCleaned": room.last_cleaned or 'Just registered',
            "guestName": guest_name,
            "cleaningStaff": cleaning_staff,
            "status_updated_by_role": room.status_updated_by_role,
            "status_updated_by_id": room.status_updated_by_id,
            "created_at": room.created_at.astimezone(ZoneInfo('Asia/Kolkata')).isoformat() if room.created_at else None,
        }

    @classmethod
    def get_rooms_and_stats(cls, filters: dict = None) -> dict:
        """
        Queries all rooms, constructs a lookup of active check-in bookings,
        computes aggregate stats for the entire inventory, applies filters,
        and returns the serialized rooms list alongside inventory stats.
        """
        # 1. Retrieve all rooms
        all_rooms = Rooms.objects.all().order_by('room_number')

        # 2. Build map of active bookings to fetch guest names in a single query
        active_bookings_dict = {}
        try:
            active_bookings = Booking.objects.filter(status='Checked-In')
            active_bookings_dict = {
                b.room_snapshot_number: b.guest_name for b in active_bookings
            }
        except Exception:
            # Table 'booking' does not exist or is not migrated yet.
            pass

        # 3. Calculate aggregate stats for ALL rooms (unfiltered)
        stats = {
            "total": all_rooms.count(),
            "available": all_rooms.filter(status='available').count(),
            "occupied": all_rooms.filter(status='occupied').count(),
            "maintenance": all_rooms.filter(status__in=['maintenance', 'under maintenance']).count()
        }

        # 4. Apply filters on the rooms queryset
        queryset = all_rooms
        if filters:
            # Search filter (matches room number or occupied guest name)
            search = filters.get('search')
            if search:
                search_query = search.strip().lower()
                # Find room numbers of active bookings matching guest name
                matching_guest_rooms = [
                    room_no for room_no, guest in active_bookings_dict.items()
                    if search_query in guest.lower()
                ]
                queryset = queryset.filter(
                    Q(room_number__icontains=search_query) |
                    Q(room_number__in=matching_guest_rooms)
                )

            # Room type filter
            room_type = filters.get('type')
            if room_type and room_type.lower() != 'all':
                queryset = queryset.filter(room_type__iexact=room_type)

            # Status filter
            status = filters.get('status')
            if status and status.lower() != 'all':
                db_status = STATUS_MAP_FE_TO_DB.get(status, status.lower())
                queryset = queryset.filter(status=db_status)

            # Floor filter
            floor = filters.get('floor')
            if floor and floor.lower() != 'all':
                # Remove st, nd, rd, th suffixes to match floor numbers (e.g. '1st' -> '1')
                clean_floor = floor.lower().replace('st','').replace('nd','').replace('rd','').replace('th','').replace('floor','').strip()
                queryset = queryset.filter(floor__icontains=clean_floor)

        # 5. Serialize rooms
        serialized_rooms = [
            cls.serialize_room_frontoffice(room, active_bookings_dict)
            for room in queryset
        ]

        return {
            "rooms": serialized_rooms,
            "stats": stats
        }

    @classmethod
    def update_room_status(cls, room_number: str, new_status: str, actor_employee) -> dict:
        """
        Updates the status of a specific room. Validates status mappings,
        updates tracking/audit fields with the frontoffice employee details,
        and saves the change.
        """
        # Validate inputs using the rooms validator
        from .validator import validate_room_status_update
        room = validate_room_status_update(room_number, new_status)

        # Convert status to database format
        # Try both direct lookup and title-case fallback
        db_status = STATUS_MAP_FE_TO_DB.get(new_status) or STATUS_MAP_FE_TO_DB.get(new_status.title())
        if not db_status:
            db_status = new_status.lower()

        room.status = db_status
        room.status_updated_by_role = 'staff'
        room.status_updated_by_id = str(actor_employee.id) if actor_employee else 'system'
        room.save()

        # Populate active check-in guest if room was marked occupied
        active_bookings_dict = None
        if db_status == 'occupied':
            try:
                active_booking = Booking.objects.filter(
                    room_snapshot_number=room.room_number,
                    status='Checked-In'
                ).first()
                if active_booking:
                    active_bookings_dict = {room.room_number: active_booking.guest_name}
            except Exception:
                pass

        return cls.serialize_room_frontoffice(room, active_bookings_dict)

    @classmethod
    def get_available_rooms(cls, include_room_number: str = None) -> dict:
        """
        Retrieves all rooms that have status='available' (case-insensitive),
        optionally including a specific room number (e.g. for edit mode).
        Returns both the list of serialized rooms and the unique room types.
        """
        query = Q(status='available')
        if include_room_number:
            query |= Q(room_number=include_room_number.strip())

        rooms = Rooms.objects.filter(query).order_by('room_number')
        
        # Extract unique available room types
        unique_types = sorted(list(set(r.room_type for r in rooms)))
        
        # Serialize rooms
        serialized_rooms = [cls.serialize_room_frontoffice(r) for r in rooms]
        
        return {
            "roomTypes": unique_types,
            "rooms": serialized_rooms
        }
