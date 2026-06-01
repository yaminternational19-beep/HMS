import re
from rest_framework import serializers
from .models import Rooms

class FlexibleJSONField(serializers.Field):
    """
    Custom field that accepts both parsed lists/dicts, raw JSON strings, 
    and binary file objects (InMemoryUploadedFile) without throwing JSON parse errors.
    """
    def to_internal_value(self, data):
        if not data:
            return []
        # If it's already a list or dict, return it as-is
        if isinstance(data, (list, dict)):
            return data
        # If it's a string, try to parse it as JSON
        if isinstance(data, str):
            import json
            try:
                return json.loads(data)
            except (json.JSONDecodeError, TypeError):
                # Fallback to single string item or comma-separated list
                if ',' in data:
                    return [d.strip() for d in data.split(',')]
                return [data]
        # For uploaded files or other objects, return as-is
        return data

    def to_representation(self, value):
        return value

class RoomsSerializer(serializers.ModelSerializer):
    """
    Serializer mapping React frontend camelCase parameters to Django database snake_case fields,
    handling input payload schema validations, and formatting response outputs natively.
    """
    # 1. Map frontend React payload parameters to backend model fields
    roomNumber = serializers.CharField(source='room_number', max_length=50)
    type = serializers.CharField(source='room_type', max_length=150)
    bedType = serializers.CharField(source='bed_type', max_length=100)
    lastCleaned = serializers.CharField(source='last_cleaned', max_length=100, required=False, allow_blank=True, allow_null=True)
    
    # Declare amenities and images explicitly as FlexibleJSONField to validate lists/files/JSON
    amenities = FlexibleJSONField(required=False)
    images = FlexibleJSONField(required=False)


    class Meta:
        model = Rooms
        fields = [
            'id', 
            'roomNumber', 
            'type', 
            'floor', 
            'status', 
            'price', 
            'capacity', 
            'bedType', 
            'amenities', 
            'images', 
            'description', 
            'lastCleaned', 
            'status_updated_by_role', 
            'status_updated_by_id',
            'created_at', 
            'updated_at'
        ]
        read_only_fields = ['id', 'status_updated_by_role', 'status_updated_by_id', 'created_at', 'updated_at']

    # =====================================================================
    # FIELD LEVEL VALIDATORS (Executed during .is_valid() check)
    # =====================================================================
    def validate_roomNumber(self, value):
        clean_value = value.strip()
        if not clean_value:
            raise serializers.ValidationError("Room Number is required.")
        if not re.match(r'^[a-zA-Z0-9-]+$', clean_value):
            raise serializers.ValidationError("Room Number must contain only alphanumeric characters or hyphens.")
        return clean_value

    def validate_price(self, value):
        try:
            numeric_price = float(value)
            if numeric_price <= 0:
                raise ValueError()
        except (TypeError, ValueError):
            raise serializers.ValidationError("Price must be a positive number.")
        return numeric_price

    def validate_capacity(self, value):
        try:
            numeric_cap = int(value)
            if numeric_cap <= 0:
                raise ValueError()
        except (TypeError, ValueError):
            raise serializers.ValidationError("Capacity must be at least 1 guest.")
        return numeric_cap

    def validate(self, data):
        """
        Class-level validation to check cross-field rules, such as floor/room number alignment.
        """
        # DRF deserialization maps frontend fields to database source fields at this stage
        room_number = data.get('room_number')
        floor = data.get('floor')

        # For partial updates (PUT), fetch existing values from database instance if not provided in payload
        if self.instance:
            if not room_number:
                room_number = self.instance.room_number
            if not floor:
                floor = self.instance.floor

        from .validator import validate_floor_and_room_number, validate_images_limit
        try:
            validate_floor_and_room_number(floor, room_number)
        except ValueError as ve:
            raise serializers.ValidationError({"roomNumber": str(ve)})

        # 2. Verify total images limit (maximum 5 images per room)
        images = data.get('images')
        # During updates, if images is not in the request, use the existing room images
        if images is None and self.instance:
            images = self.instance.images

        request = self.context.get('request')
        files = request.FILES if request else None

        try:
            validate_images_limit(images, files=files)
        except ValueError as ve:
            raise serializers.ValidationError({"images": str(ve)})

        return data

