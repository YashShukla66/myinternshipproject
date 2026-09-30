from rest_framework import viewsets

from .models import Driver
from .serializers import DriverSerializer
from trips.models import sync_all_driver_statuses


class DriverViewSet(viewsets.ModelViewSet):

    queryset = Driver.objects.all()

    serializer_class = DriverSerializer

    filterset_fields = [
        "status",
    ]

    search_fields = [
        "full_name",
        "license_number",
    ]

    ordering_fields = [
        "joining_date",
        "created_at",
    ]

    def get_queryset(self):
        sync_all_driver_statuses()
        return Driver.objects.all()