from drivers.models import Driver
from django.db import models



class Vehicle(models.Model):

    VEHICLE_TYPES = (
        ("CAR", "Car"),
        ("BIKE", "Bike"),
        ("TRUCK", "Truck"),
        ("BUS", "Bus"),
    )

    STATUS_CHOICES = (
        ("ACTIVE", "Active"),
        ("MAINTENANCE", "Maintenance"),
        ("INACTIVE", "Inactive"),
    )

    registration_number = models.CharField(
        max_length=30,
        unique=True,
    )

    vehicle_name = models.CharField(
        max_length=100,
    )

    vehicle_type = models.CharField(
        max_length=20,
        choices=VEHICLE_TYPES,
    )

    manufacturer = models.CharField(
        max_length=100,
    )

    model = models.CharField(
        max_length=100,
    )

    manufacturing_year = models.PositiveIntegerField()

    color = models.CharField(
        max_length=30,
    )

    fuel_type = models.CharField(
        max_length=30,
    )

    seating_capacity = models.PositiveIntegerField()

    mileage = models.FloatField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="ACTIVE",
    )

    purchase_date = models.DateField()

    insurance_expiry = models.DateField()

    image = models.ImageField(
        upload_to="vehicles/",
        blank=True,
        null=True,
    )

    assigned_driver = models.OneToOneField(
    Driver,
    on_delete=models.SET_NULL,
    null=True,
    blank=True,
    related_name="vehicle",
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return f"{self.registration_number} - {self.vehicle_name}"