from django.db import models
from django.utils import timezone

from drivers.models import Driver
from vehicles.models import Vehicle


class Trip(models.Model):

    STATUS_CHOICES = (
        ("SCHEDULED", "Scheduled"),
        ("ONGOING", "Ongoing"),
        ("COMPLETED", "Completed"),
        ("CANCELLED", "Cancelled"),
    )

    trip_id = models.CharField(
        max_length=20,
        unique=True,
    )

    driver = models.ForeignKey(
        Driver,
        on_delete=models.CASCADE,
        related_name="trips",
    )

    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name="trips",
    )

    source = models.CharField(
        max_length=200,
    )

    destination = models.CharField(
        max_length=200,
    )

    start_time = models.DateTimeField()

    end_time = models.DateTimeField(
        null=True,
        blank=True,
    )

    distance = models.FloatField(
        default=0,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="SCHEDULED",
    )

    notes = models.TextField(
        blank=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def calculate_status(self):
        if self.status == "CANCELLED":
            return "CANCELLED"
        now = timezone.now()
        if self.end_time and now >= self.end_time:
            return "COMPLETED"
        elif self.start_time and now >= self.start_time:
            return "ONGOING"
        else:
            return "SCHEDULED"

    def save(self, *args, **kwargs):
        old_driver = None
        if self.pk:
            try:
                old_trip = Trip.objects.get(pk=self.pk)
                if old_trip.driver_id != self.driver_id:
                    old_driver = old_trip.driver
            except Trip.DoesNotExist:
                pass

        if self.start_time:
            self.status = self.calculate_status()
        super().save(*args, **kwargs)

        # Sync assigned Driver status
        if self.driver:
            if self.status in ["SCHEDULED", "ONGOING"]:
                if self.driver.status != "ON_TRIP" and self.driver.status != "LEAVE":
                    self.driver.status = "ON_TRIP"
                    self.driver.save(update_fields=["status"])
            elif self.status in ["COMPLETED", "CANCELLED"]:
                has_active = Trip.objects.filter(
                    driver=self.driver, status__in=["SCHEDULED", "ONGOING"]
                ).exclude(id=self.id).exists()
                if not has_active and self.driver.status == "ON_TRIP":
                    self.driver.status = "AVAILABLE"
                    self.driver.save(update_fields=["status"])

        # If driver changed on this trip, re-evaluate old driver
        if old_driver and old_driver.pk != (self.driver.pk if self.driver else None):
            has_active_for_old = Trip.objects.filter(
                driver=old_driver, status__in=["SCHEDULED", "ONGOING"]
            ).exclude(id=self.id).exists()
            if not has_active_for_old and old_driver.status == "ON_TRIP":
                old_driver.status = "AVAILABLE"
                old_driver.save(update_fields=["status"])

    def delete(self, *args, **kwargs):
        driver = self.driver
        trip_id = self.id
        result = super().delete(*args, **kwargs)
        if driver:
            has_active = Trip.objects.filter(
                driver=driver, status__in=["SCHEDULED", "ONGOING"]
            ).exclude(id=trip_id).exists()
            if not has_active and driver.status == "ON_TRIP":
                driver.status = "AVAILABLE"
                driver.save(update_fields=["status"])
        return result

    def __str__(self):
        return self.trip_id


from django.db.models.signals import post_delete
from django.dispatch import receiver


@receiver(post_delete, sender=Trip)
def sync_driver_on_trip_delete(sender, instance, **kwargs):
    if instance.driver_id:
        try:
            driver = instance.driver
            has_active = Trip.objects.filter(
                driver=driver, status__in=["SCHEDULED", "ONGOING"]
            ).exclude(id=instance.id).exists()
            if not has_active and driver.status == "ON_TRIP":
                driver.status = "AVAILABLE"
                driver.save(update_fields=["status"])
        except Driver.DoesNotExist:
            pass


def sync_all_driver_statuses():
    """
    Ensure all trip states and driver availability statuses are accurate and in sync.
    """
    now = timezone.now()

    # 1. Complete trips whose end_time has passed
    completed_trips = Trip.objects.filter(
        status__in=["SCHEDULED", "ONGOING"],
        end_time__isnull=False,
        end_time__lte=now,
    ).exclude(status="CANCELLED")
    for trip in completed_trips:
        trip.status = "COMPLETED"
        trip.save()

    # 2. Auto-start trips whose start_time has arrived
    ongoing_trips = Trip.objects.filter(
        status="SCHEDULED",
        start_time__lte=now,
    ).exclude(status="CANCELLED")
    for trip in ongoing_trips:
        if not trip.end_time or trip.end_time > now:
            trip.status = "ONGOING"
            trip.save()

    # 3. Synchronize driver statuses based on active trips (SCHEDULED or ONGOING)
    active_driver_ids = set(
        Trip.objects.filter(
            status__in=["SCHEDULED", "ONGOING"]
        ).values_list("driver_id", flat=True)
    )

    # Any driver with an active trip should be ON_TRIP (unless on LEAVE)
    Driver.objects.filter(
        id__in=active_driver_ids
    ).exclude(status="LEAVE").exclude(status="ON_TRIP").update(status="ON_TRIP")

    # Any driver currently ON_TRIP who has no active trips should be reverted to AVAILABLE
    Driver.objects.filter(
        status="ON_TRIP"
    ).exclude(id__in=active_driver_ids).update(status="AVAILABLE")