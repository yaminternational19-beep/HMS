from rest_framework import serializers
from .models import Shifts
from .validators import (
    validate_shift_name,
    validate_shift_time,
    validate_shift_icon,
    validate_shift_color
)

class ShiftsSerializer(serializers.ModelSerializer):
    """
    Serializer to map, validate, and serialize Shifts data models.
    Supports partial updates and comprehensive schema validation constraints.
    """
    class Meta:
        model = Shifts
        fields = [
            'id',
            'name',
            'time',
            'icon',
            'color',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def validate_name(self, value):
        try:
            validate_shift_name(value)
        except ValueError as ve:
            raise serializers.ValidationError(str(ve))
        
        # Ensure name uniqueness, ignoring the current instance during updates
        clean_name = value.strip()
        queryset = Shifts.objects.filter(name__iexact=clean_name)
        if self.instance:
            queryset = queryset.exclude(id=self.instance.id)
            
        if queryset.exists():
            raise serializers.ValidationError("A shift with this name already exists.")
            
        return clean_name

    def validate_time(self, value):
        try:
            validate_shift_time(value)
        except ValueError as ve:
            raise serializers.ValidationError(str(ve))
        return value.strip()

    def validate_icon(self, value):
        try:
            validate_shift_icon(value)
        except ValueError as ve:
            raise serializers.ValidationError(str(ve))
        return value.strip().lower()

    def validate_color(self, value):
        try:
            validate_shift_color(value)
        except ValueError as ve:
            raise serializers.ValidationError(str(ve))
        return value.strip().lower()
