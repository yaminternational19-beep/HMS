from rest_framework import serializers
from .models import Booking, BookingPayment
from apps.superadmin.rooms.models import Rooms

class BookingSerializer(serializers.ModelSerializer):
    """
    Serializer mapping React frontend camelCase parameters to Django database
    snake_case fields, parsing JSON payloads and handling output responses.
    """
    bookingCode = serializers.CharField(source='booking_code', required=False, allow_blank=True)
    guestName = serializers.CharField(source='guest_name', max_length=255)
    phone = serializers.CharField(max_length=50)
    
    # Map to the new renamed room snapshot columns in database
    roomNumber = serializers.CharField(source='room_snapshot_number', max_length=50)
    roomType = serializers.CharField(source='room_snapshot_type', max_length=150)
    
    checkIn = serializers.DateTimeField(source='check_in', format='%Y-%m-%d')
    checkOut = serializers.DateTimeField(source='check_out', format='%Y-%m-%d')
    
    # Custom non-model fields for payments (handled in service layer)
    paymentStatus = serializers.CharField(required=False, default='Pending')
    amount = serializers.FloatField(required=False, default=0.0)
    
    cancellationReason = serializers.CharField(source='cancellation_reason', required=False, allow_blank=True, default='')
    totalGuests = serializers.IntegerField(source='total_guests', required=False, default=1)
    rawData = serializers.JSONField(source='raw_data', required=False, default=dict)

    class Meta:
        model = Booking
        fields = [
            'id',
            'bookingCode',
            'guestName',
            'phone',
            'roomNumber',
            'roomType',
            'checkIn',
            'checkOut',
            'status',
            'paymentStatus',
            'totalGuests',
            'amount',
            'cancellationReason',
            'rawData',
            'created_at',
            'updated_at'
        ]
        read_only_fields = ['id', 'created_at', 'updated_at']

    def to_internal_value(self, data):
        """
        Normalize incoming parameters to match the serializer field names.
        """
        if isinstance(data, dict):
            data = data.copy()
            # Map 'room' alias to 'roomNumber'
            if 'room' in data and 'roomNumber' not in data:
                data['roomNumber'] = data['room']
            # Map 'raw' alias to 'rawData'
            if 'raw' in data and 'rawData' not in data:
                data['rawData'] = data['raw']
            # Map 'id' alias to 'bookingCode'
            if 'id' in data and 'bookingCode' not in data:
                data['bookingCode'] = data['id']
                
        return super().to_internal_value(data)

    def to_representation(self, instance):
        """
        Inject aliases and payment values into output JSON.
        """
        rep = super().to_representation(instance)
        
        # Pull payment fields from BookingPayment relation
        try:
            payment = instance.payment_details
            rep['amount'] = float(payment.final_amount)
            rep['paymentStatus'] = payment.payment_status
        except BookingPayment.DoesNotExist:
            # Fallback to values stored in rawData
            raw_details = rep.get('rawData', {}) or {}
            pay_raw = raw_details.get('paymentDetails', {}) or {}
            rep['amount'] = float(pay_raw.get('finalAmount') or 0.0)
            rep['paymentStatus'] = pay_raw.get('paymentStatus') or 'Pending'

        # Expose aliases for frontend compatibility
        rep['room'] = rep.get('roomNumber')
        rep['raw'] = rep.get('rawData')
        rep['id'] = rep.get('bookingCode')
        return rep

    def validate(self, data):
        """
        Serializer level validation logic.
        """
        check_in = data.get('check_in')
        check_out = data.get('check_out')

        # Retrieve existing values if not provided during partial updates (PUT/PATCH)
        if self.instance:
            if not check_in:
                check_in = self.instance.check_in
            if not check_out:
                check_out = self.instance.check_out

        from .validator import validate_booking_dates
        try:
            validate_booking_dates(check_in, check_out)
        except ValueError as ve:
            raise serializers.ValidationError({"checkIn": str(ve)})

        # Validate Government ID proof details
        raw_data = data.get('raw_data', {})
        id_proof = raw_data.get('idProof', {}) if isinstance(raw_data, dict) else None

        if not self.instance or id_proof:
            from .validator import validate_guest_id_proof
            if self.instance and not id_proof:
                existing_raw = self.instance.raw_data or {}
                id_proof = existing_raw.get('idProof', {})
            
            if id_proof:
                try:
                    validate_guest_id_proof(id_proof.get('idType'), id_proof.get('idNumber'))
                except ValueError as ve:
                    raise serializers.ValidationError({"idProof": str(ve)})
            elif not self.instance:
                raise serializers.ValidationError({"idProof": "Government ID proof details are required."})

        return data
