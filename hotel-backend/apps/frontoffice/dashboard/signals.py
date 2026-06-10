from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.frontoffice.booking.models import Booking, BookingPayment
from .models import FrontofficeAlert

@receiver(post_save, sender=Booking)
def create_booking_alert(sender, instance, created, **kwargs):
    if created:
        FrontofficeAlert.objects.create(
            title="New Booking Received",
            desc=f"Booking {instance.booking_code} created for {instance.guest_name}.",
            type="info",
            related_model="Booking",
            related_id=instance.booking_code
        )

@receiver(post_save, sender=BookingPayment)
def create_payment_alert(sender, instance, created, **kwargs):
    if created:
        FrontofficeAlert.objects.create(
            title="New Payment Received",
            desc=f"Payment of {instance.amount} recorded for {instance.booking.booking_code if instance.booking else 'a booking'}.",
            type="success",
            related_model="BookingPayment",
            related_id=instance.transaction_id
        )
