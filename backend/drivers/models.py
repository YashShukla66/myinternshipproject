from django.db import models


class Driver(models.Model):

    STATUS_CHOICES = (
        ("AVAILABLE", "Available"),
        ("ON_TRIP", "On Trip"),
        ("LEAVE", "Leave"),
    )

    full_name = models.CharField(
        max_length=150,
    )

    email = models.EmailField(
        unique=True,
    )

    phone = models.CharField(
        max_length=15,
    )

    license_number = models.CharField(
        max_length=50,
        unique=True,
    )

    address = models.TextField()

    date_of_birth = models.DateField()

    joining_date = models.DateField()

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="AVAILABLE",
    )

    image = models.ImageField(
        upload_to="drivers/",
        blank=True,
        null=True,
    )

    created_at = models.DateTimeField(
        auto_now_add=True,
    )

    updated_at = models.DateTimeField(
        auto_now=True,
    )

    def __str__(self):
        return self.full_name