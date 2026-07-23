from django.contrib import admin

from .models import Driver


@admin.register(Driver)
class DriverAdmin(admin.ModelAdmin):

    list_display = (
        "full_name",
        "phone",
        "license_number",
        "status",
    )

    search_fields = (
        "full_name",
        "license_number",
    )

    list_filter = (
        "status",
    )