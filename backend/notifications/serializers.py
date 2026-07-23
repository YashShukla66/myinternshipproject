from rest_framework import serializers

from .models import Notification


class NotificationSerializer(serializers.ModelSerializer):

    vehicle_name = serializers.CharField(
        source="vehicle.vehicle_name",
        read_only=True,
    )

    class Meta:

        model = Notification

        fields = "__all__"