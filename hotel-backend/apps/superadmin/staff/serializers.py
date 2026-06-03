from rest_framework import serializers
from .models import Staff
from apps.superadmin.shifts.models import Shifts

class StaffSerializer(serializers.ModelSerializer):
    # Map the database ForeignKey relation's shift_id directly to 'shiftId' expected by frontend
    shiftId = serializers.CharField(source='shift_id', required=True)
    isCheckedIn = serializers.SerializerMethodField()
    joined = serializers.SerializerMethodField()
    phone = serializers.SerializerMethodField()
    emergencyPhone = serializers.SerializerMethodField()
    logs = serializers.SerializerMethodField()
    role = serializers.SerializerMethodField()

    class Meta:
        model = Staff
        fields = [
            'id',
            'uniqueCode',
            'name',
            'dept',
            'role',
            'password',
            'email',
            'phoneCountry',
            'phoneNo',
            'phone',
            'emergencyCountry',
            'emergencyNo',
            'emergencyPhone',
            'shiftId',
            'status',
            'isCheckedIn',
            'address',
            'govtProofType',
            'govtProofId',
            'govtProofFileName',
            'govtProofFileUrl',
            'profileFileName',
            'profileFileUrl',
            'joined',
            'logs',
            'created_at',
            'updated_at'
        ]
        # These fields are generated automatically by our business service layer
        read_only_fields = ['id', 'uniqueCode', 'joined', 'logs', 'role', 'phone', 'emergencyPhone', 'created_at', 'updated_at']

    def get_isCheckedIn(self, obj):
        from .services import StaffService
        return StaffService.is_staff_on_duty(obj)

    def get_joined(self, obj):
        if obj.created_at:
            return obj.created_at.strftime("%b %Y")
        return ""

    def get_role(self, obj):
        return obj.dept

    def get_phone(self, obj):
        return f"{obj.phoneCountry} {obj.phoneNo}"

    def get_emergencyPhone(self, obj):
        return f"{obj.emergencyCountry} {obj.emergencyNo}"

    def get_logs(self, obj):
        return []

    def validate_shiftId(self, value):
        # Enforce referential integrity checks on shifts relation
        try:
            Shifts.objects.get(id=value.strip())
        except Shifts.DoesNotExist:
            raise serializers.ValidationError(f"Shift timing selection with ID '{value}' does not exist.")
        return value.strip()
