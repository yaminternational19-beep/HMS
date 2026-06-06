from django.db import models
from django.utils.translation import gettext_lazy as _
from apps.superadmin.rooms.models import Rooms

# Choices Classes
class BookingStatus(models.TextChoices):
    PENDING = 'Pending', _('Pending')
    CONFIRMED = 'Confirmed', _('Confirmed')
    CHECKED_IN = 'Checked-In', _('Checked-In')
    CHECKED_OUT = 'Checked-Out', _('Checked-Out')
    CANCELLED = 'Cancelled', _('Cancelled')

class PaymentStatus(models.TextChoices):
    PENDING = 'Pending', _('Pending')
    PARTIAL = 'Partial', _('Partial')
    PAID = 'Paid', _('Paid')

class PaymentMethod(models.TextChoices):
    CASH = 'Cash', _('Cash')
    CARD = 'Card', _('Card')
    UPI = 'UPI', _('UPI')
    NET_BANKING = 'NetBanking', _('NetBanking')

class VerificationStatus(models.TextChoices):
    PENDING = 'Pending', _('Pending')
    VERIFIED = 'Verified', _('Verified')
    REJECTED = 'Rejected', _('Rejected')

class TransactionType(models.TextChoices):
    ADVANCE = 'Advance', _('Advance')
    PAYMENT = 'Payment', _('Payment')
    REFUND = 'Refund', _('Refund')


# Core Booking Model
class Booking(models.Model):
    id = models.BigAutoField(primary_key=True)
    booking_code = models.CharField(max_length=50, unique=True, db_index=True)
    guest_name = models.CharField(max_length=255, db_index=True)
    phone = models.CharField(max_length=50, db_index=True)
    
    # Room relation and snapshot fields
    room = models.ForeignKey(Rooms, on_delete=models.SET_NULL, null=True, blank=True, related_name='bookings')
    room_snapshot_number = models.CharField(max_length=50, db_index=True)
    room_snapshot_type = models.CharField(max_length=150, db_index=True)
    
    # Dates
    check_in = models.DateTimeField(db_index=True)
    check_out = models.DateTimeField(db_index=True)
    
    # General details
    booking_source = models.CharField(max_length=100, default='Walk-in')
    purpose_of_visit = models.CharField(max_length=255, blank=True, default='')
    adults_count = models.IntegerField(default=1)
    children_count = models.IntegerField(default=0)
    extra_bed = models.BooleanField(default=False)
    expected_arrival = models.DateTimeField(null=True, blank=True)
    special_requests = models.TextField(blank=True, default='')
    
    # Address and Contact details
    nationality = models.CharField(max_length=100, default='Indian')
    email = models.EmailField(max_length=255, blank=True, default='')
    address = models.TextField(blank=True, default='')
    city = models.CharField(max_length=150, blank=True, default='')
    state = models.CharField(max_length=150, blank=True, default='')
    country = models.CharField(max_length=150, default='India')
    pincode = models.CharField(max_length=20, blank=True, default='')

    # Lifecycle tracking fields
    status = models.CharField(max_length=50, choices=BookingStatus.choices, default=BookingStatus.CONFIRMED, db_index=True)
    checked_in_at = models.DateTimeField(null=True, blank=True)
    checked_out_at = models.DateTimeField(null=True, blank=True)
    cancelled_at = models.DateTimeField(null=True, blank=True)
    cancellation_reason = models.TextField(blank=True, default='')

    # Emergency Contact 
    emergency_contact_name = models.CharField(max_length=255, blank=True, default='')
    emergency_contact_relation = models.CharField(max_length=100, blank=True, default='')
    emergency_contact_phone = models.CharField(max_length=50, blank=True, default='')

    # Vehicle / Luggage / Smoking Preferences
    vehicle_number = models.CharField(max_length=50, blank=True, default='')
    luggage_count = models.IntegerField(default=0)
    smoking_preference = models.CharField(max_length=50, default='Non-Smoking')

    # Primary ID Proof fields (Main guest verification)
    id_type = models.CharField(max_length=100, blank=True, default='')
    id_number = models.CharField(max_length=100, blank=True, default='', db_index=True)
    verification_status = models.CharField(max_length=50, choices=VerificationStatus.choices, default=VerificationStatus.PENDING)

    # Passport and VISA details for foreign guests
    passport_number = models.CharField(max_length=100, blank=True, default='')
    passport_expiry = models.DateField(null=True, blank=True)
    visa_number = models.CharField(max_length=100, blank=True, default='')
    visa_expiry_date = models.DateField(null=True, blank=True)
    country_of_issue = models.CharField(max_length=100, blank=True, default='')

    # System & Audit Notes
    remarks = models.TextField(blank=True, default='')
    internal_notes = models.TextField(blank=True, default='')
    
    # Audit fields
    created_by = models.CharField(max_length=100, blank=True, null=True)
    updated_by = models.CharField(max_length=100, blank=True, null=True)

    # Backward compatible JSON snapshot
    raw_data = models.JSONField(default=dict)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'Booking'
        indexes = [
            models.Index(fields=['booking_code', 'status']),
            models.Index(fields=['guest_name', 'phone']),
        ]

    def __str__(self):
        return f"Booking {self.booking_code} - {self.guest_name}"

    def clean(self):
        super().clean()
        if self.check_in and self.check_out and self.check_out <= self.check_in:
            from django.core.exceptions import ValidationError
            raise ValidationError(_("Check-out date/time must be strictly after the check-in date/time."))


# Financial Summary Model
class BookingPayment(models.Model):
    id = models.BigAutoField(primary_key=True)
    booking = models.OneToOneField(Booking, on_delete=models.CASCADE, related_name='payment_details')
    
    room_rent = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    extra_charges = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    discount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    gst = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    advance_paid = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    final_amount = models.DecimalField(max_digits=12, decimal_places=2, default=0.00)
    
    payment_status = models.CharField(max_length=50, choices=PaymentStatus.choices, default=PaymentStatus.PENDING, db_index=True)
    payment_method = models.CharField(max_length=50, choices=PaymentMethod.choices, default=PaymentMethod.CASH)
    transaction_id = models.CharField(max_length=150, blank=True, default='')
    invoice_number = models.CharField(max_length=150, blank=True, default='')
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'BookingPayment'

    def __str__(self):
        return f"Payment Summary - Booking: {self.booking.booking_code} - Total: ₹{self.final_amount}"


# Granular Transactions Model
class BookingTransaction(models.Model):
    id = models.BigAutoField(primary_key=True)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='transactions')
    
    transaction_type = models.CharField(max_length=50, choices=TransactionType.choices)
    amount = models.DecimalField(max_digits=12, decimal_places=2)
    payment_method = models.CharField(max_length=50, choices=PaymentMethod.choices, default=PaymentMethod.CASH)
    transaction_id = models.CharField(max_length=150, blank=True, default='')
    remarks = models.TextField(blank=True, default='')
    
    created_at = models.DateTimeField(auto_now_add=True)
    created_by = models.CharField(max_length=100, blank=True, null=True)

    class Meta:
        db_table = 'BookingTransaction'

    def __str__(self):
        return f"{self.transaction_type} of ₹{self.amount} for {self.booking.booking_code}"


# Guest Table (Primary and Additional Guests)
class BookingGuest(models.Model):
    id = models.BigAutoField(primary_key=True)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='guests')
    
    full_name = models.CharField(max_length=255, db_index=True)
    gender = models.CharField(max_length=50, blank=True, default='')
    age = models.IntegerField(null=True, blank=True)
    relation = models.CharField(max_length=100, blank=True, default='')
    phone = models.CharField(max_length=50, blank=True, default='', db_index=True)
    email = models.EmailField(max_length=255, blank=True, default='')
    nationality = models.CharField(max_length=100, default='Indian')
    
    id_type = models.CharField(max_length=100, blank=True, default='')
    id_number = models.CharField(max_length=100, blank=True, default='', db_index=True)
    address = models.TextField(blank=True, default='')
    document_file = models.CharField(max_length=255, blank=True, default='')
    is_primary_guest = models.BooleanField(default=False)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'BookingGuest'

    def __str__(self):
        role = "Primary" if self.is_primary_guest else "Additional"
        return f"{self.full_name} ({role}) - Booking: {self.booking.booking_code}"


# Guest Documents Uploads Model
class BookingDocument(models.Model):
    id = models.BigAutoField(primary_key=True)
    booking = models.ForeignKey(Booking, on_delete=models.CASCADE, related_name='documents')
    guest = models.ForeignKey(BookingGuest, on_delete=models.CASCADE, null=True, blank=True, related_name='documents')
    
    document_type = models.CharField(max_length=100)
    document_number = models.CharField(max_length=100, db_index=True)
    front_file = models.CharField(max_length=255, blank=True, default='')
    back_file = models.CharField(max_length=255, blank=True, default='')
    verification_status = models.CharField(max_length=50, choices=VerificationStatus.choices, default=VerificationStatus.PENDING)
    
    uploaded_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'BookingDocument'

    def __str__(self):
        return f"{self.document_type} - {self.document_number} - Booking: {self.booking.booking_code}"
