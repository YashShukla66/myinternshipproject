from django.db.models import Count
from rest_framework.response import Response
from rest_framework.views import APIView

from drivers.models import Driver
from trips.models import Trip
from vehicles.models import Vehicle
from maintenance.models import MaintenanceRecord

from django.db.models import Count

from maintenance.models import MaintenanceRecord


class DashboardAPIView(APIView):

    def get(self, request):

        data = {

            "total_vehicles": Vehicle.objects.count(),

            "active_vehicles":
                Vehicle.objects.filter(status="ACTIVE").count(),

            "maintenance_vehicles":
                Vehicle.objects.filter(
                    status="MAINTENANCE"
                ).count(),

            "total_drivers":
                Driver.objects.count(),

            "available_drivers":
                Driver.objects.filter(
                    status="AVAILABLE"
                ).count(),

            "total_trips":
                Trip.objects.count(),

            "ongoing_trips":
                Trip.objects.filter(
                    status="ONGOING"
                ).count(),

            "completed_trips":
                Trip.objects.filter(
                    status="COMPLETED"
                ).count(),

            "cancelled_trips":
                Trip.objects.filter(
                    status="CANCELLED"
                ).count(),

            # Maintenance Statistics
            "total_maintenance":
                MaintenanceRecord.objects.count(),

            "completed_maintenance":
                MaintenanceRecord.objects.filter(
                    status="COMPLETED"
                ).count(),

            "pending_maintenance":
                MaintenanceRecord.objects.filter(
                    status="PENDING"
                ).count(),
        }

        # Recent 5 Trips
        recent_trips = Trip.objects.order_by("-created_at")[:5]

        recent_data = []

        for trip in recent_trips:

            recent_data.append({

                "trip_id": trip.trip_id,
                "driver": trip.driver.full_name,
                "vehicle": trip.vehicle.registration_number,
                "status": trip.status,

            })

        data["recent_trips"] = recent_data

        return Response(data)
class VehicleStatusChartAPIView(APIView):

    def get(self, request):

        data = Vehicle.objects.values(
            "status"
        ).annotate(
            total=Count("id")
        )

        return Response(data)


class DriverStatusChartAPIView(APIView):

    def get(self, request):

        data = Driver.objects.values(
            "status"
        ).annotate(
            total=Count("id")
        )

        return Response(data)


class TripStatusChartAPIView(APIView):

    def get(self, request):

        data = Trip.objects.values(
            "status"
        ).annotate(
            total=Count("id")
        )

        return Response(data)


class MaintenanceStatusChartAPIView(APIView):

    def get(self, request):

        data = MaintenanceRecord.objects.values(
            "status"
        ).annotate(
            total=Count("id")
        )

        return Response(data)