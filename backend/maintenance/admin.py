from django.contrib import admin

from .models import MaintenanceRecord


@admin.register(MaintenanceRecord)
class MaintenanceAdmin(admin.ModelAdmin):

    list_display = (
        "vehicle",
        "maintenance_type",
        "service_date",
        "cost",
        "status",
    )

    list_filter = (
        "status",
        "maintenance_type",
    )

    search_fields = (
        "vehicle__registration_number",
        "service_center",
    )