from rest_framework import serializers

from .models import Vehicle


class VehicleSerializer(serializers.ModelSerializer):

    assigned_driver_name = serializers.CharField(
        source="assigned_driver.full_name",
        read_only=True,
    )

    class Meta:
        model = Vehicle
        fields = "__all__"