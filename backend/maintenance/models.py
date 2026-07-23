from django.db import models

from vehicles.models import Vehicle


class MaintenanceRecord(models.Model):

    STATUS_CHOICES = (
        ("PENDING", "Pending"),
        ("COMPLETED", "Completed"),
    )

    MAINTENANCE_TYPES = (
        ("OIL_CHANGE", "Oil Change"),
        ("ENGINE", "Engine Service"),
        ("BRAKE", "Brake Repair"),
        ("TYRE", "Tyre Replacement"),
        ("GENERAL", "General Service"),
    )

    vehicle = models.ForeignKey(
        Vehicle,
        on_delete=models.CASCADE,
        related_name="maintenance_records",
    )

    maintenance_type = models.CharField(
        max_length=30,
        choices=MAINTENANCE_TYPES,
    )

    service_date = models.DateField()

    service_center = models.CharField(
        max_length=150,
    )

    description = models.TextField()

    cost = models.DecimalField(
        max_digits=10,
        decimal_places=2,
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="PENDING",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"{self.vehicle.vehicle_name} - {self.maintenance_type}"