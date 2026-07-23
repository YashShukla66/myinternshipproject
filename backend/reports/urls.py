from django.urls import path

from .views import (
    VehiclePDFReportAPIView,
    VehicleExcelReportAPIView,
)

urlpatterns = [

    path(
        "reports/vehicles/pdf/",
        VehiclePDFReportAPIView.as_view(),
    ),

    path(
        "reports/vehicles/excel/",
        VehicleExcelReportAPIView.as_view(),
    ),

]