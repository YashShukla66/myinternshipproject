from django.urls import path

from .views import (
    VehiclePDFReportAPIView,
    VehicleExcelReportAPIView,
    AIPredictionPDFReportAPIView,
    AIPredictionExcelReportAPIView,
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
    path(
        "reports/ai-predictions/pdf/",
        AIPredictionPDFReportAPIView.as_view(),
    ),
    path(
        "reports/ai-predictions/excel/",
        AIPredictionExcelReportAPIView.as_view(),
    ),
]