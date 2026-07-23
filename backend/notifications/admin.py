from django.contrib import admin

from .models import Notification


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):

    list_display = (
        "title",
        "vehicle",
        "priority",
        "is_read",
        "created_at",
    )

    list_filter = (
        "priority",
        "is_read",
    )

    search_fields = (
        "title",
        "vehicle__registration_number",
    )