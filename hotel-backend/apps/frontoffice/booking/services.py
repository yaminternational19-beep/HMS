import os
from decimal import Decimal
from zoneinfo import ZoneInfo
from django.db import models
from django.db.models import Q
from django.utils import timezone
from apps.superadmin.rooms.models import Rooms
from .models import (
    Booking, 
    BookingPayment, 
    BookingTransaction, 
    BookingGuest, 
    BookingDocument,
    BookingStatus,
    VerificationStatus
)
from .validator import validate_room_availability

class BookingService:
    """
    Service Layer handling business logic, database queries, and room status synchronization
    for Bookings, returning camelCase structures compatible with the frontend.
    """

    @staticmethod
    def serialize_booking(booking: Booking) -> dict:
        """
        Translates a database Booking object to the exact camelCase structure expected by the frontend.
        """
        if not booking:
            return {}
            
        # Try to fetch payment details
        try:
            payment = booking.payment_details
            amount = float(payment.final_amount)
            payment_status = payment.payment_status
        except BookingPayment.DoesNotExist:
            raw_details = booking.raw_data or {}
            pay_raw = raw_details.get('paymentDetails', {}) or {}
            amount = float(pay_raw.get('finalAmount') or 0.00)
            payment_status = pay_raw.get('paymentStatus') or 'Pending'

        # Parse dates to YYYY-MM-DD
        check_in_str = booking.check_in.astimezone(ZoneInfo('Asia/Kolkata')).strftime('%Y-%m-%d') if booking.check_in else ''
        check_out_str = booking.check_out.astimezone(ZoneInfo('Asia/Kolkata')).strftime('%Y-%m-%d') if booking.check_out else ''

        return {
            "id": booking.booking_code, # UI maps id to bookingCode
            "bookingCode": booking.booking_code,
            "guestName": booking.guest_name,
            "phone": booking.phone,
            "roomNumber": booking.room_snapshot_number,
            "room": booking.room_snapshot_number,  # Alias for roomNumber
            "roomType": booking.room_snapshot_type,
            "checkIn": check_in_str,
            "checkOut": check_out_str,
            "status": booking.status,
            "paymentStatus": payment_status,
            "totalGuests": booking.total_guests,
            "amount": amount,
            "cancellationReason": booking.cancellation_reason,
            "rawData": booking.raw_data or {},
            "raw": booking.raw_data or {},  # Alias for rawData
            "created_at": booking.created_at.astimezone(ZoneInfo('Asia/Kolkata')).isoformat() if booking.created_at else None,
            "updated_at": booking.updated_at.astimezone(ZoneInfo('Asia/Kolkata')).isoformat() if booking.updated_at else None,
        }

    @classmethod
    def get_all_bookings(cls, filters: dict = None) -> list:
        """
        Queries and filters booking records, ordering them from newest to oldest.
        """
        queryset = Booking.objects.all().order_by('-created_at')

        if filters:
            # 1. Search filter: Guest Name, Phone, or Booking Code
            search = filters.get('search')
            if search:
                queryset = queryset.filter(
                    Q(guest_name__icontains=search) |
                    Q(phone__icontains=search) |
                    Q(booking_code__icontains=search)
                )

            # 2. Status filter
            status = filters.get('status')
            if status and status.lower() != 'all':
                queryset = queryset.filter(status__iexact=status)

            # 3. Room Type filter
            room_type = filters.get('roomType') or filters.get('room_type')
            if room_type and room_type.lower() != 'all':
                queryset = queryset.filter(room_snapshot_type__iexact=room_type)

        return [cls.serialize_booking(b) for b in queryset]

    @classmethod
    def get_booking_by_code(cls, booking_code: str) -> dict:
        """
        Fetches and serializes a single booking by its unique booking code.
        """
        try:
            booking = Booking.objects.get(booking_code=booking_code.strip())
            return cls.serialize_booking(booking)
        except Booking.DoesNotExist:
            return None

    @classmethod
    def create_booking(cls, data: dict, actor_employee) -> dict:
        """
        Creates a new reservation record, populates normalized tables,
        and synchronizes room inventory status.
        """
        room_snapshot_number = data.get('room_snapshot_number', '').strip()
        check_in = data.get('check_in')
        check_out = data.get('check_out')

        # 1. Verify Room availability
        room_instance = validate_room_availability(room_snapshot_number, check_in, check_out)

        # 2. Sequential code generation
        count = Booking.objects.count()
        booking_code = f"BKG-{str(count + 1).zfill(3)}"
        while Booking.objects.filter(booking_code=booking_code).exists():
            count += 1
            booking_code = f"BKG-{str(count + 1).zfill(3)}"

        # 3. Room status logic
        status = data.get('status', 'Confirmed')
        if status == 'Checked-In':
            room_instance.status = 'occupied'
            room_instance.status_updated_by_role = 'staff'
            room_instance.status_updated_by_id = str(actor_employee.id)
            room_instance.save()

        # 4. Extract fields from nested raw_data payload
        raw_data = data.get('raw_data', {})
        booking_details = raw_data.get('bookingDetails', {}) or {}
        primary_guest = raw_data.get('primaryGuest', {}) or {}
        id_proof = raw_data.get('idProof', {}) or {}
        room_details = raw_data.get('roomDetails', {}) or {}
        emergency_contact = raw_data.get('emergencyContact', {}) or {}

        # Set up lifecycle dates
        checked_in_at = timezone.now() if status == 'Checked-In' else None
        cancelled_at = timezone.now() if status == 'Cancelled' else None

        actor_code = getattr(actor_employee, 'staff_code', str(actor_employee.id)) if actor_employee else 'system'

        # Build Booking instance
        booking = Booking(
            booking_code=booking_code,
            guest_name=data.get('guest_name'),
            phone=data.get('phone'),
            room=room_instance,
            room_snapshot_number=room_snapshot_number,
            room_snapshot_type=data.get('room_snapshot_type'),
            check_in=check_in,
            check_out=check_out,
            status=status,
            total_guests=int(data.get('total_guests', 1)),
            
            # Enterprise fields
            booking_source=booking_details.get('bookingSource', 'Walk-in'),
            purpose_of_visit=booking_details.get('purposeOfVisit', ''),
            adults_count=int(booking_details.get('adultsCount', 1)),
            children_count=int(booking_details.get('childrenCount', 0)),
            extra_bed=bool(booking_details.get('extraBed', False)),
            special_requests=booking_details.get('specialRequests', ''),
            
            nationality=primary_guest.get('nationality', 'Indian'),
            email=primary_guest.get('email', ''),
            address=f"{primary_guest.get('address1', '')}\n{primary_guest.get('address2', '')}".strip(),
            city=primary_guest.get('city', ''),
            state=primary_guest.get('state', ''),
            country=primary_guest.get('country', 'India'),
            pincode=primary_guest.get('pincode', ''),
            
            checked_in_at=checked_in_at,
            cancelled_at=cancelled_at,
            
            emergency_contact_name=emergency_contact.get('name', ''),
            emergency_contact_relation=emergency_contact.get('relation', ''),
            emergency_contact_phone=emergency_contact.get('phone', ''),
            
            vehicle_number=room_details.get('vehicleNumber', ''),
            luggage_count=int(room_details.get('luggageCount', 0)),
            smoking_preference=room_details.get('smoking', 'Non-Smoking'),
            
            id_type=id_proof.get('idType', ''),
            id_number=id_proof.get('idNumber', ''),
            verification_status=id_proof.get('verificationStatus', 'Pending'),
            
            passport_number=id_proof.get('passportNumber', ''),
            visa_number=id_proof.get('visaNumber', ''),
            country_of_issue=id_proof.get('countryOfIssue', ''),
            
            remarks=raw_data.get('notes', ''),
            created_by=actor_code,
            updated_by=actor_code,
            raw_data=raw_data
        )

        # Parse dates
        expected_arrival_str = booking_details.get('expectedArrival')
        if expected_arrival_str:
            try:
                booking.expected_arrival = timezone.datetime.fromisoformat(expected_arrival_str.replace('Z', '+00:00'))
            except (ValueError, TypeError):
                pass

        passport_expiry_str = id_proof.get('passportExpiry')
        if passport_expiry_str:
            try:
                booking.passport_expiry = timezone.datetime.strptime(passport_expiry_str, '%Y-%m-%d').date()
            except (ValueError, TypeError):
                pass

        visa_expiry_str = id_proof.get('visaExpiryDate')
        if visa_expiry_str:
            try:
                booking.visa_expiry_date = timezone.datetime.strptime(visa_expiry_str, '%Y-%m-%d').date()
            except (ValueError, TypeError):
                pass

        booking.save()

        # 5. Save BookingPayment Financial Summary using Decimal values
        pay_raw = raw_data.get('paymentDetails', {}) or {}
        room_rent = Decimal(str(pay_raw.get('roomRent') or room_instance.price or 0.00))
        extra_charges = Decimal(str(pay_raw.get('extraCharges') or 0.00))
        discount = Decimal(str(pay_raw.get('discount') or 0.00))
        gst = Decimal(str(pay_raw.get('gst') or 0.00))
        advance_paid = Decimal(str(pay_raw.get('advancePaid') or 0.00))
        final_amount = Decimal(str(pay_raw.get('finalAmount') or data.get('amount') or 0.00))

        payment_status = pay_raw.get('paymentStatus') or data.get('paymentStatus') or 'Pending'
        payment_method = pay_raw.get('paymentMethod') or 'Cash'
        transaction_id = pay_raw.get('transactionId') or ''
        invoice_number = pay_raw.get('invoiceNumber') or ''

        payment = BookingPayment(
            booking=booking,
            room_rent=room_rent,
            extra_charges=extra_charges,
            discount=discount,
            gst=gst,
            advance_paid=advance_paid,
            final_amount=final_amount,
            payment_status=payment_status,
            payment_method=payment_method,
            transaction_id=transaction_id,
            invoice_number=invoice_number
        )
        payment.save()

        # 6. Create initial Advance Transaction if advance was paid
        if advance_paid > Decimal('0.00'):
            trans = BookingTransaction(
                booking=booking,
                transaction_type='Advance',
                amount=advance_paid,
                payment_method=payment_method,
                transaction_id=transaction_id,
                remarks='Initial advance payment registered.',
                created_by=actor_code
            )
            trans.save()

        # 7. Populate BookingGuest Table for Primary Guest
        primary_age = None
        primary_age_str = primary_guest.get('age')
        if primary_age_str:
            try:
                primary_age = int(primary_age_str)
            except ValueError:
                pass

        primary_g = BookingGuest(
            booking=booking,
            full_name=primary_guest.get('guestName') or booking.guest_name,
            gender=primary_guest.get('gender', 'Male'),
            age=primary_age,
            relation='Self',
            phone=primary_guest.get('phone') or booking.phone,
            email=primary_guest.get('email', ''),
            nationality=primary_guest.get('nationality', 'Indian'),
            id_type=id_proof.get('idType', ''),
            id_number=id_proof.get('idNumber', ''),
            address=booking.address,
            is_primary_guest=True
        )
        primary_g.save()

        # 8. Save Primary Guest Documents
        front_file = id_proof.get('frontFileName', '')
        back_file = id_proof.get('backFileName', '')
        if front_file or back_file:
            doc = BookingDocument(
                booking=booking,
                guest=primary_g,
                document_type=id_proof.get('idType', 'Aadhaar'),
                document_number=id_proof.get('idNumber', ''),
                front_file=front_file,
                back_file=back_file,
                verification_status=booking.verification_status
            )
            doc.save()

        # 9. Register Additional guests
        additional_guests_list = raw_data.get('additionalGuests', []) or []
        for g_raw in additional_guests_list:
            g_age = None
            g_age_str = g_raw.get('age')
            if g_age_str:
                try:
                    g_age = int(g_age_str)
                except ValueError:
                    pass
            
            guest_item = BookingGuest(
                booking=booking,
                full_name=g_raw.get('name', ''),
                gender=g_raw.get('gender', 'Male'),
                age=g_age,
                relation=g_raw.get('relation', ''),
                phone=g_raw.get('phone', ''),
                email=g_raw.get('email', ''),
                nationality=g_raw.get('nationality', 'Indian'),
                id_type=g_raw.get('idType', ''),
                id_number=g_raw.get('idNumber', ''),
                address=g_raw.get('address', ''),
                is_primary_guest=False
            )
            guest_item.save()

        return cls.serialize_booking(booking)

    @classmethod
    def update_booking(cls, booking_code: str, data: dict, actor_employee=None) -> dict:
        """
        Updates fields of an existing booking, adjusting room statuses if check-in or checkout state changes.
        """
        try:
            booking = Booking.objects.get(booking_code=booking_code.strip())
        except Booking.DoesNotExist:
            return None

        room_snapshot_number = data.get('room_snapshot_number', booking.room_snapshot_number)
        check_in = data.get('check_in', booking.check_in)
        check_out = data.get('check_out', booking.check_out)

        # 1. If date or room is changing, validate availability overlap
        if room_snapshot_number != booking.room_snapshot_number or check_in != booking.check_in or check_out != booking.check_out:
            room_instance = validate_room_availability(room_snapshot_number, check_in, check_out, exclude_booking_id=booking.id)
            booking.room = room_instance
            booking.room_snapshot_number = room_snapshot_number
            booking.check_in = check_in
            booking.check_out = check_out
        else:
            room_instance = booking.room

        # Update core details
        if 'guest_name' in data:
            booking.guest_name = data['guest_name']
        if 'phone' in data:
            booking.phone = data['phone']
        if 'room_snapshot_type' in data:
            booking.room_snapshot_type = data['room_snapshot_type']
        if 'total_guests' in data:
            booking.total_guests = int(data['total_guests'])
        if 'raw_data' in data:
            booking.raw_data = data['raw_data']

        # Status Transition & Room Status Sync
        new_status = data.get('status')
        if new_status and new_status != booking.status:
            booking.status = new_status
            
            # Sync timestamps
            if new_status == 'Checked-In':
                booking.checked_in_at = timezone.now()
            elif new_status == 'Checked-Out':
                booking.checked_out_at = timezone.now()
            elif new_status == 'Cancelled':
                booking.cancelled_at = timezone.now()

            # Sync room state based on checkout or cancel
            if room_instance:
                actor_role = 'staff' if actor_employee else 'system'
                actor_id = str(actor_employee.id) if actor_employee else 'system'
                
                if new_status == 'Checked-In':
                    room_instance.status = 'occupied'
                elif new_status == 'Checked-Out':
                    room_instance.status = 'cleaning'
                elif new_status == 'Cancelled':
                    room_instance.status = 'available'
                
                room_instance.status_updated_by_role = actor_role
                room_instance.status_updated_by_id = actor_id
                room_instance.save()

        if 'cancellation_reason' in data:
            booking.cancellation_reason = data['cancellation_reason']

        # Update audits
        actor_code = getattr(actor_employee, 'staff_code', str(actor_employee.id)) if actor_employee else 'system'
        booking.updated_by = actor_code

        # Re-extract fields from raw_data if modified
        raw_data = booking.raw_data or {}
        booking_details = raw_data.get('bookingDetails', {}) or {}
        primary_guest = raw_data.get('primaryGuest', {}) or {}
        id_proof = raw_data.get('idProof', {}) or {}
        room_details = raw_data.get('roomDetails', {}) or {}
        emergency_contact = raw_data.get('emergencyContact', {}) or {}

        booking.booking_source = booking_details.get('bookingSource', booking.booking_source)
        booking.purpose_of_visit = booking_details.get('purposeOfVisit', booking.purpose_of_visit)
        booking.adults_count = int(booking_details.get('adultsCount', booking.adults_count))
        booking.children_count = int(booking_details.get('childrenCount', booking.children_count))
        booking.extra_bed = bool(booking_details.get('extraBed', booking.extra_bed))
        booking.special_requests = booking_details.get('specialRequests', booking.special_requests)
        
        booking.nationality = primary_guest.get('nationality', booking.nationality)
        booking.email = primary_guest.get('email', booking.email)
        booking.address = f"{primary_guest.get('address1', '')}\n{primary_guest.get('address2', '')}".strip() or booking.address
        booking.city = primary_guest.get('city', booking.city)
        booking.state = primary_guest.get('state', booking.state)
        booking.country = primary_guest.get('country', booking.country)
        booking.pincode = primary_guest.get('pincode', booking.pincode)
        
        booking.emergency_contact_name = emergency_contact.get('name', booking.emergency_contact_name)
        booking.emergency_contact_relation = emergency_contact.get('relation', booking.emergency_contact_relation)
        booking.emergency_contact_phone = emergency_contact.get('phone', booking.emergency_contact_phone)
        
        booking.vehicle_number = room_details.get('vehicleNumber', booking.vehicle_number)
        booking.luggage_count = int(room_details.get('luggageCount', booking.luggage_count))
        booking.smoking_preference = room_details.get('smoking', booking.smoking_preference)
        
        booking.id_type = id_proof.get('idType', booking.id_type)
        booking.id_number = id_proof.get('idNumber', booking.id_number)
        booking.verification_status = id_proof.get('verificationStatus', booking.verification_status)
        
        booking.passport_number = id_proof.get('passportNumber', booking.passport_number)
        booking.visa_number = id_proof.get('visaNumber', booking.visa_number)
        booking.country_of_issue = id_proof.get('countryOfIssue', booking.country_of_issue)

        expected_arrival_str = booking_details.get('expectedArrival')
        if expected_arrival_str:
            try:
                booking.expected_arrival = timezone.datetime.fromisoformat(expected_arrival_str.replace('Z', '+00:00'))
            except (ValueError, TypeError):
                pass

        booking.save()

        # Update payment summary details
        pay_raw = raw_data.get('paymentDetails', {}) or {}
        
        try:
            payment = booking.payment_details
        except BookingPayment.DoesNotExist:
            payment = BookingPayment(booking=booking)

        if 'roomRent' in pay_raw:
            payment.room_rent = Decimal(str(pay_raw['roomRent'] or 0.00))
        if 'extraCharges' in pay_raw:
            payment.extra_charges = Decimal(str(pay_raw['extraCharges'] or 0.00))
        if 'discount' in pay_raw:
            payment.discount = Decimal(str(pay_raw['discount'] or 0.00))
        if 'gst' in pay_raw:
            payment.gst = Decimal(str(pay_raw['gst'] or 0.00))
        
        # Track if advance paid changed to make audit transaction
        old_advance = payment.advance_paid
        if 'advancePaid' in pay_raw:
            payment.advance_paid = Decimal(str(pay_raw['advancePaid'] or 0.00))
        
        if 'finalAmount' in pay_raw:
            payment.final_amount = Decimal(str(pay_raw['finalAmount'] or 0.00))
        elif 'amount' in data:
            payment.final_amount = Decimal(str(data['amount']))
            
        if 'paymentStatus' in pay_raw:
            payment.payment_status = pay_raw['paymentStatus']
        elif 'paymentStatus' in data:
            payment.payment_status = data['paymentStatus']
            
        if 'paymentMethod' in pay_raw:
            payment.payment_method = pay_raw['paymentMethod']
        if 'transactionId' in pay_raw:
            payment.transaction_id = pay_raw['transactionId']
        if 'invoiceNumber' in pay_raw:
            payment.invoice_number = pay_raw['invoiceNumber']

        payment.save()

        # If advance changed/increased, create a payment transaction history
        if payment.advance_paid > old_advance:
            diff = payment.advance_paid - old_advance
            trans = BookingTransaction(
                booking=booking,
                transaction_type='Payment',
                amount=diff,
                payment_method=payment.payment_method,
                transaction_id=payment.transaction_id,
                remarks='Additional payment recorded during update.',
                created_by=actor_code
            )
            trans.save()

        # Sync BookingGuests (Delete and Recreate list)
        BookingGuest.objects.filter(booking=booking).delete()
        BookingDocument.objects.filter(booking=booking).delete()

        # Primary guest recreate
        primary_age = None
        primary_age_str = primary_guest.get('age')
        if primary_age_str:
            try:
                primary_age = int(primary_age_str)
            except ValueError:
                pass

        primary_g = BookingGuest(
            booking=booking,
            full_name=primary_guest.get('guestName') or booking.guest_name,
            gender=primary_guest.get('gender', 'Male'),
            age=primary_age,
            relation='Self',
            phone=primary_guest.get('phone') or booking.phone,
            email=primary_guest.get('email', ''),
            nationality=primary_guest.get('nationality', 'Indian'),
            id_type=id_proof.get('idType', ''),
            id_number=id_proof.get('idNumber', ''),
            address=booking.address,
            is_primary_guest=True
        )
        primary_g.save()

        # Save Primary Documents recreate
        front_file = id_proof.get('frontFileName', '')
        back_file = id_proof.get('backFileName', '')
        if front_file or back_file:
            doc = BookingDocument(
                booking=booking,
                guest=primary_g,
                document_type=id_proof.get('idType', 'Aadhaar'),
                document_number=id_proof.get('idNumber', ''),
                front_file=front_file,
                back_file=back_file,
                verification_status=booking.verification_status
            )
            doc.save()

        # Additional guests recreate
        additional_guests_list = raw_data.get('additionalGuests', []) or []
        for g_raw in additional_guests_list:
            g_age = None
            g_age_str = g_raw.get('age')
            if g_age_str:
                try:
                    g_age = int(g_age_str)
                except ValueError:
                    pass
            
            guest_item = BookingGuest(
                booking=booking,
                full_name=g_raw.get('name', ''),
                gender=g_raw.get('gender', 'Male'),
                age=g_age,
                relation=g_raw.get('relation', ''),
                phone=g_raw.get('phone', ''),
                email=g_raw.get('email', ''),
                nationality=g_raw.get('nationality', 'Indian'),
                id_type=g_raw.get('idType', ''),
                id_number=g_raw.get('idNumber', ''),
                address=g_raw.get('address', ''),
                is_primary_guest=False
            )
            guest_item.save()

        return cls.serialize_booking(booking)
