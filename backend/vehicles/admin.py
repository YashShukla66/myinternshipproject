from django.contrib import admin

from .models import Vehicle


@admin.register(Vehicle)
class VehicleAdmin(admin.ModelAdmin):

    list_display = (
    "registration_number",
    "vehicle_name",
    "assigned_driver",
    "vehicle_type",
    "status",
    )

    search_fields = (
        "registration_number",
        "vehicle_name",
    )

    list_filter = (
        "vehicle_type",
        "status",
    )