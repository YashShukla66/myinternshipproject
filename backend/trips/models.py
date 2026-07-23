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
        if self.start_time:
            self.status = self.calculate_status()
        super().save(*args, **kwargs)

        # Sync assigned Driver status
        if self.driver:
            if self.status == "ONGOING":
                self.driver.status = "ON_TRIP"
                self.driver.save(update_fields=["status"])
            elif self.status in ["COMPLETED", "CANCELLED"]:
                has_other_ongoing = Trip.objects.filter(
                    driver=self.driver, status="ONGOING"
                ).exclude(id=self.id).exists()
                if not has_other_ongoing:
                    self.driver.status = "AVAILABLE"
                    self.driver.save(update_fields=["status"])

    def __str__(self):
        return self.trip_id