from django.contrib.auth.models import AbstractUser
from django.db import models


class User(AbstractUser):
    """
    Custom User Model
    """

    ROLE_CHOICES = (
        ("ADMIN", "Admin"),
        ("MANAGER", "Fleet Manager"),
        ("DRIVER", "Driver"),
    )

    role = models.CharField(
        max_length=20,
        choices=ROLE_CHOICES,
        default="MANAGER",
    )

    phone = models.CharField(
        max_length=15,
        blank=True,
        null=True,
    )

    profile_image = models.ImageField(
        upload_to="profiles/",
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
        return self.username


class OTPVerification(models.Model):
    """
    Stores pending OTP verification records for email-based registration.
    Registration data is held here until OTP is verified, then a User is created.
    """

    email = models.EmailField()
    otp = models.CharField(max_length=6)
    username = models.CharField(max_length=150)
    password_hash = models.CharField(max_length=255)
    role = models.CharField(max_length=20, default="MANAGER")
    phone = models.CharField(max_length=15, blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)

    class Meta:
        ordering = ["-created_at"]

    def is_expired(self):
        from django.conf import settings
        from django.utils import timezone
        import datetime

        expiry_minutes = getattr(settings, "OTP_EXPIRY_MINUTES", 5)
        return timezone.now() > self.created_at + datetime.timedelta(
            minutes=expiry_minutes
        )

    def __str__(self):
        return f"OTP for {self.email} ({'expired' if self.is_expired() else 'active'})"