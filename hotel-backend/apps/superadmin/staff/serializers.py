from rest_framework import serializers
from .models import Staff
from apps.superadmin.shifts.models import Shifts

class StaffSerializer(serializers.ModelSerializer):
    # Map the database ForeignKey relation's shift_id directly to 'shiftId' expected by frontend
    shiftId = serializers.CharField(source='shift', required=True)
    isCheckedIn = serializers.BooleanField(source='is_checked_in', default=False)
    uniqueCode = serializers.CharField(source='unique_code', read_only=True)
    phoneCountry = serializers.CharField(source='phone_country', required=False)
    phoneNo = serializers.CharField(source='phone_no', required=False)
    emergencyCountry = serializers.CharField(source='emergency_country', required=False)
    emergencyNo = serializers.CharField(source='emergency_no', required=False)
    govtProofType = serializers.CharField(source='govt_proof_type', required=False)
    govtProofId = serializers.CharField(source='govt_proof_id', required=False)
    govtProofFileName = serializers.CharField(source='govt_proof_file_name', required=False, allow_null=True)
    govtProofFileUrl = serializers.CharField(source='govt_proof_file_url', required=False, allow_null=True)
    profileFileName = serializers.CharField(source='profile_file_name', required=False, allow_null=True)
    profileFileUrl = serializers.CharField(source='profile_file_url', required=False, allow_null=True)

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
        return f"{obj.phone_country} {obj.phone_no}"

    def get_emergencyPhone(self, obj):
        return f"{obj.emergency_country} {obj.emergency_no}"

    def get_logs(self, obj):
        return []

    def validate_shiftId(self, value):
        # Enforce referential integrity checks on shifts relation
        try:
            Shifts.objects.get(shift_code=value.strip())
        except Shifts.DoesNotExist:
            raise serializers.ValidationError(f"Shift timing selection with ID '{value}' does not exist.")
        return value.strip()
