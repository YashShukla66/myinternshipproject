from rest_framework import serializers

from .models import Driver


class DriverSerializer(serializers.ModelSerializer):

    assigned_vehicle = serializers.CharField(
        source="vehicle.registration_number",
        read_only=True,
    )

    class Meta:
        model = Driver
        fields = "__all__"