from rest_framework import serializers

from .models import MaintenanceRecord


class MaintenanceSerializer(serializers.ModelSerializer):

    vehicle_name = serializers.CharField(
        source="vehicle.vehicle_name",
        read_only=True,
    )

    class Meta:
        model = MaintenanceRecord
        fields = "__all__"