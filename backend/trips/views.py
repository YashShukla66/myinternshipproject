from django.utils import timezone
from rest_framework import viewsets

from .models import Trip
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
        now = timezone.now()
        # Auto-complete trips whose end_time has passed
        completed_trips = Trip.objects.filter(
            status__in=["SCHEDULED", "ONGOING"],
            end_time__isnull=False,
            end_time__lte=now,
        ).exclude(status="CANCELLED")
        for trip in completed_trips:
            trip.status = "COMPLETED"
            trip.save()

        # Auto-start trips whose start_time has arrived but end_time is in future or null
        ongoing_trips = Trip.objects.filter(
            status="SCHEDULED",
            start_time__lte=now,
        ).exclude(status="CANCELLED")
        for trip in ongoing_trips:
            if not trip.end_time or trip.end_time > now:
                trip.status = "ONGOING"
                trip.save()

        return Trip.objects.all()