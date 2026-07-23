from django.urls import path

from .views import (
    PredictMaintenanceAPIView,
    VehicleMaintenancePredictionAPIView,
)

urlpatterns = [

    path(
        "predict-maintenance/",
        PredictMaintenanceAPIView.as_view(),
    ),

    path(
        "vehicles/<int:vehicle_id>/predict-maintenance/",
        VehicleMaintenancePredictionAPIView.as_view(),
    ),

]