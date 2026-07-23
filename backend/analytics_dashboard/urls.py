from django.urls import path

from .views import (
    DashboardAPIView,
    VehicleStatusChartAPIView,
    DriverStatusChartAPIView,
    TripStatusChartAPIView,
    MaintenanceStatusChartAPIView,
)

urlpatterns = [

    path(
        "dashboard/",
        DashboardAPIView.as_view(),
    ),

    path(
        "charts/vehicles/",
        VehicleStatusChartAPIView.as_view(),
    ),

    path(
        "charts/drivers/",
        DriverStatusChartAPIView.as_view(),
    ),

    path(
        "charts/trips/",
        TripStatusChartAPIView.as_view(),
    ),

    path(
        "charts/maintenance/",
        MaintenanceStatusChartAPIView.as_view(),
    ),

]