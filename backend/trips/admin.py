from django.contrib import admin

from .models import Trip


@admin.register(Trip)
class TripAdmin(admin.ModelAdmin):

    list_display = (
        "trip_id",
        "driver",
        "vehicle",
        "source",
        "destination",
        "status",
    )

    search_fields = (
        "trip_id",
        "source",
        "destination",
    )

    list_filter = (
        "status",
    )