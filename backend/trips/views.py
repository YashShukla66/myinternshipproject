from rest_framework import viewsets

from .models import Trip, sync_all_driver_statuses
from .serializers import TripSerializer


class TripViewSet(viewsets.ModelViewSet):

    queryset = Trip.objects.all()   # Required by DRF router for basename detection
    serializer_class = TripSerializer

    filterset_fields = [
        "status",
    ]

    search_fields = [
        "trip_id",
        "source",
        "destination",
    ]

    ordering_fields = [
        "start_time",
        "created_at",
    ]

    def get_queryset(self):
        sync_all_driver_statuses()
        return Trip.objects.all()