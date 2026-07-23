from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import MaintenanceViewSet

router = DefaultRouter()

router.register(
    r"maintenance",
    MaintenanceViewSet
)

urlpatterns = [
    path("", include(router.urls)),
]