import os
from zoneinfo import ZoneInfo
from django.db.models import Q
from core.services.upload_service import UploadService
from .models import Rooms

class RoomService:
    """
    Service Layer handling all database queries, formatting, and file-handling 
    business logic for Rooms CRUD operations, aligned with React parameters.
    """

    @staticmethod
    def serialize_room(room: Rooms) -> dict:
        """
        Translates a database Rooms object into the exact camelCase structure 
        expected by the React frontend, avoiding any frontend modifications.
        """
        if not room:
            return {}
            
        import os
        backend_url = os.environ.get('BACKEND_URL', 'http://localhost:8000')
        # Transform relative paths to absolute backend host URLs so the React frontend can load them
        formatted_images = [
            f"{backend_url}{img}" if isinstance(img, str) and img.startswith('/uploads/') else img
            for img in (room.images or [])
        ]

        return {
            "id": room.room_number, # React uses roomNumber as ID
            "roomNumber": room.room_number,
            "type": room.room_type,
            "floor": room.floor,
            "status": room.status,
            "price": float(room.price),
            "capacity": int(room.capacity),
            "bedType": room.bed_type,
            "amenities": room.amenities, # Returns direct array
            "images": formatted_images,  # Returns direct array of absolute URLs
            "description": room.description,
            "lastCleaned": room.last_cleaned,
            "status_updated_by_role": room.status_updated_by_role,
            "status_updated_by_id": room.status_updated_by_id,
            "created_at": room.created_at.astimezone(ZoneInfo('Asia/Kolkata')).isoformat() if room.created_at else None,
        }

    @classmethod
    def get_all_rooms(cls, filters: dict = None) -> list:
        """
        Queries and filters room records, returning serialized camelCase outputs.
        """
        queryset = Rooms.objects.all().order_by('room_number')

        if filters:
            # 1. Search Query (matching room number or type)
            search = filters.get('search')
            if search:
                queryset = queryset.filter(
                    Q(room_number__icontains=search) | 
                    Q(room_type__icontains=search)
                )

            # 2. Status Filter
            status = filters.get('status')
            if status and status.lower() != 'all':
                queryset = queryset.filter(status=status.lower())

            # 3. Room Type Filter
            room_type = filters.get('room_type') or filters.get('type')
            if room_type and room_type.lower() != 'all':
                queryset = queryset.filter(room_type__iexact=room_type)

            # 4. Floor Filter
            floor = filters.get('floor')
            if floor and floor.lower() != 'all':
                queryset = queryset.filter(floor__iexact=floor)

        return [cls.serialize_room(room) for room in queryset]

    @classmethod
    def get_room_by_number(cls, room_number: str) -> dict:
        """
        Fetches a single room by its unique room number.
        """
        try:
            room = Rooms.objects.get(room_number=room_number.strip())
            return cls.serialize_room(room)
        except Rooms.DoesNotExist:
            return None

    @classmethod
    def create_room(cls, data: dict, files=None, actor_role: str = None, actor_id: str = None) -> dict:
        """
        Creates and persists a new Room record. Maps incoming React parameters 
        to Python database fields and handles dynamic image uploads.
        """
        room_number = data.get('roomNumber', '').strip()
        if not room_number:
            raise ValueError("Room number is required.")

        if Rooms.objects.filter(room_number=room_number).exists():
            raise ValueError(f"Room {room_number} already exists in database.")

        # 1. Parse amenities from both JSON string and raw array lists
        amenities = data.get('amenities', ['WiFi', 'AC', 'TV'])
        if isinstance(amenities, str):
            import json
            try:
                amenities = json.loads(amenities)
            except (json.JSONDecodeError, TypeError):
                if ',' in amenities:
                    amenities = [a.strip() for a in amenities.split(',')]
                else:
                    amenities = [amenities]

        # 2. Parse pre-existing image URLs
        existing_urls = []
        existing_images_raw = data.get('existing_images')
        if existing_images_raw:
            import json
            try:
                existing_urls = json.loads(existing_images_raw)
            except (json.JSONDecodeError, TypeError):
                pass
        
        if not existing_urls:
            raw_images = data.get('images', [])
            if isinstance(raw_images, list):
                # Filter out any local preview blobs that got submitted
                existing_urls = [img for img in raw_images if isinstance(img, str) and not img.startswith('blob:')]
            elif isinstance(raw_images, str) and raw_images:
                try:
                    import json
                    parsed_images = json.loads(raw_images)
                    if isinstance(parsed_images, list):
                        existing_urls = [img for img in parsed_images if isinstance(img, str) and not img.startswith('blob:')]
                except (json.JSONDecodeError, TypeError):
                    if not raw_images.startswith('blob:'):
                        existing_urls = [raw_images]

        # 3. Upload any new binary files
        new_images = []
        if files:
            uploaded_images = files.getlist('images')
            if uploaded_images:
                new_images = UploadService.upload_multiple_files(uploaded_images, subfolder='rooms')
                
        # 4. Merge them and enforce max 5 images limit
        total_images = (existing_urls + new_images)[:5]

        # Fallback to placeholder if no images at all
        if not total_images:
            total_images = ['https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=500&auto=format&fit=crop&q=60']

        # Extract specifications with fallbacks
        room = Rooms(
            room_number=room_number,
            floor=data.get('floor', '1st Floor'),
            room_type=data.get('type', 'Standard'),
            bed_type=data.get('bedType', 'Queen'),
            capacity=int(data.get('capacity', 2)),
            price=float(data.get('price', 3500.0)),
            status=data.get('status', 'available').lower(),
            amenities=amenities,
            images=total_images,
            description=data.get('description', 'No description provided.').strip(),
            last_cleaned=data.get('lastCleaned', 'Just registered'),
            status_updated_by_role=actor_role,
            status_updated_by_id=actor_id
        )
        room.save()
        return cls.serialize_room(room)

    @classmethod
    def update_room(cls, room_number: str, data: dict, files=None, actor_role: str = None, actor_id: str = None) -> dict:
        """
        Updates an existing room record. Tracks status changes and updates audit logs.
        """
        try:
            room = Rooms.objects.get(room_number=room_number.strip())
        except Rooms.DoesNotExist:
            return None

        # Check if the room status is being modified
        new_status = data.get('status')
        if new_status and new_status.lower() != room.status:
            room.status = new_status.lower()
            room.status_updated_by_role = actor_role
            room.status_updated_by_id = actor_id

        # Update remaining specifications
        if 'floor' in data:
            room.floor = data['floor']
        if 'type' in data:
            room.room_type = data['type']
        if 'bedType' in data:
            room.bed_type = data['bedType']
        if 'capacity' in data:
            room.capacity = int(data['capacity'])
        if 'price' in data:
            room.price = float(data['price'])
        if 'description' in data:
            room.description = data['description'].strip()
        if 'lastCleaned' in data:
            room.last_cleaned = data['lastCleaned']

        # Parse amenities from both JSON string and raw array lists
        if 'amenities' in data:
            amenities = data['amenities']
            if isinstance(amenities, str):
                import json
                try:
                    amenities = json.loads(amenities)
                except (json.JSONDecodeError, TypeError):
                    if ',' in amenities:
                        amenities = [a.strip() for a in amenities.split(',')]
                    else:
                        amenities = [amenities]
            room.amenities = amenities

        # Handle image file updates: merge existing URLs and new file uploads
        existing_urls = []
        existing_images_raw = data.get('existing_images')
        if existing_images_raw:
            import json
            try:
                existing_urls = json.loads(existing_images_raw)
            except (json.JSONDecodeError, TypeError):
                pass
        
        if not existing_urls and 'images' in data:
            raw_images = data['images']
            if isinstance(raw_images, list):
                existing_urls = [img for img in raw_images if isinstance(img, str) and not img.startswith('blob:')]
            elif isinstance(raw_images, str) and raw_images:
                try:
                    import json
                    parsed_images = json.loads(raw_images)
                    if isinstance(parsed_images, list):
                        existing_urls = [img for img in parsed_images if isinstance(img, str) and not img.startswith('blob:')]
                except (json.JSONDecodeError, TypeError):
                    if not raw_images.startswith('blob:'):
                        existing_urls = [raw_images]

        # Upload any new binary files
        new_images = []
        if files:
            uploaded_images = files.getlist('images')
            if uploaded_images:
                new_images = UploadService.upload_multiple_files(uploaded_images, subfolder='rooms')
                
        # Merge existing and new images
        if existing_urls or new_images:
            room.images = (existing_urls + new_images)[:5]

        room.save()
        return cls.serialize_room(room)

    @staticmethod
    def delete_room(room_number: str) -> bool:
        """
        Deletes a room record by its unique room number.
        """
        try:
            room = Rooms.objects.get(room_number=room_number.strip())
            room.delete()
            return True
        except Rooms.DoesNotExist:
            return False
