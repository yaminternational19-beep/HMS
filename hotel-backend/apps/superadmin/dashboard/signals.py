from django.db.models.signals import post_save
from django.dispatch import receiver
from apps.superadmin.rooms.models import Rooms
from apps.superadmin.staff.models import Staff
from apps.superadmin.shifts.models import Shifts
from .models import SuperadminAlert

@receiver(post_save, sender=Rooms)
def create_room_alert(sender, instance, created, **kwargs):
    if created:
        SuperadminAlert.objects.create(
            title="New Room Created",
            desc=f"Room {instance.room_number} ({instance.type}) was added to the inventory.",
            type="info",
            related_model="Rooms",
            related_id=instance.room_number
        )

@receiver(post_save, sender=Staff)
def create_staff_alert(sender, instance, created, **kwargs):
    if created:
        SuperadminAlert.objects.create(
            title="New Staff Onboarded",
            desc=f"{instance.name} was added as a {instance.role}.",
            type="info",
            related_model="Staff",
            related_id=instance.staff_id
        )

@receiver(post_save, sender=Shifts)
def create_shift_alert(sender, instance, created, **kwargs):
    if created:
        SuperadminAlert.objects.create(
            title="New Shift Assigned",
            desc=f"Shift {instance.shift_type} created for {instance.staff.name if instance.staff else 'unassigned'}.",
            type="info",
            related_model="Shift",
            related_id=str(instance.id) if hasattr(instance, 'id') else ''
        )
