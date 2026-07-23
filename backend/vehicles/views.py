from rest_framework import viewsets
from rest_framework.filters import SearchFilter, OrderingFilter
from django_filters.rest_framework import DjangoFilterBackend

from .models import Vehicle
from .serializers import VehicleSerializer


class VehicleViewSet(viewsets.ModelViewSet):

    queryset = Vehicle.objects.all()

    serializer_class = VehicleSerializer

    filter_backends = [
        DjangoFilterBackend,
        SearchFilter,
        OrderingFilter,
    ]

    filterset_fields = [
        "vehicle_type",
        "status",
        "fuel_type",
    ]

    search_fields = [
        "registration_number",
        "vehicle_name",
        "manufacturer",
    ]

    ordering_fields = [
        "created_at",
        "mileage",
        "manufacturing_year",
    ]

    ordering = ["-created_at"]