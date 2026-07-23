from rest_framework import viewsets

from .models import MaintenanceRecord
from .serializers import MaintenanceSerializer


class MaintenanceViewSet(viewsets.ModelViewSet):

    queryset = MaintenanceRecord.objects.all()

    serializer_class = MaintenanceSerializer

    filterset_fields = [
        "status",
        "maintenance_type",
    ]

    search_fields = [
        "service_center",
    ]

    ordering_fields = [
        "service_date",
        "cost",
    ]