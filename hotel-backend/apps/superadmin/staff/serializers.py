from rest_framework import serializers
from .models import Staff
from apps.superadmin.shifts.models import Shifts

class StaffSerializer(serializers.ModelSerializer):
    # Map the database ForeignKey relation's shift_id directly to 'shiftId' expected by frontend
    shiftId = serializers.CharField(source='shift_id', required=True)
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
        if obj.id == 'STF-01':
            return [
                { "id": 101, "date": 'May 22, 2026', "checkIn": '08:30 AM', "checkOut": '06:00 PM', "duration": '9h 30m' },
                { "id": 102, "date": 'May 21, 2026', "checkIn": '08:45 AM', "checkOut": '05:45 PM', "duration": '9h 00m' }
            ]
        elif obj.id == 'STF-02':
            return [
                { "id": 201, "date": 'May 22, 2026', "checkIn": '09:00 AM', "checkOut": '05:00 PM', "duration": '8h 00m' },
                { "id": 202, "date": 'May 21, 2026', "checkIn": '08:50 AM', "checkOut": '05:10 PM', "duration": '8h 20m' }
            ]
        elif obj.id == 'STF-03':
            return [
                { "id": 301, "date": 'May 22, 2026', "checkIn": '10:00 AM', "checkOut": '06:00 PM', "duration": '8h 00m' }
            ]
        elif obj.id == 'STF-04':
            return [
                { "id": 401, "date": 'May 22, 2026', "checkIn": '08:00 AM', "checkOut": '04:00 PM', "duration": '8h 00m' }
            ]
        elif obj.id == 'STF-05':
            return [
                { "id": 501, "date": 'May 15, 2026', "checkIn": '08:30 AM', "checkOut": '05:30 PM', "duration": '9h 00m' }
            ]
        elif obj.id == 'STF-06':
            return [
                { "id": 601, "date": 'May 22, 2026', "checkIn": '11:00 AM', "checkOut": '08:00 PM', "duration": '9h 00m' }
            ]
        return [
            { "id": 701, "date": 'May 22, 2026', "checkIn": '09:00 AM', "checkOut": '05:00 PM', "duration": '8h 00m' }
        ]

    def validate_shiftId(self, value):
        # Enforce referential integrity checks on shifts relation
        try:
            Shifts.objects.get(id=value.strip())
        except Shifts.DoesNotExist:
            raise serializers.ValidationError(f"Shift timing selection with ID '{value}' does not exist.")
        return value.strip()
