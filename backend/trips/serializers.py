from rest_framework import serializers

from .models import Trip


class TripSerializer(serializers.ModelSerializer):

    driver_name = serializers.CharField(
        source="driver.full_name",
        read_only=True,
    )

    vehicle_number = serializers.CharField(
        source="vehicle.registration_number",
        read_only=True,
    )

    class Meta:
        model = Trip
        fields = "__all__"