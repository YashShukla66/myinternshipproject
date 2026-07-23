from django.urls import include, path
from rest_framework.routers import DefaultRouter

from .views import TripViewSet

router = DefaultRouter()
router.register(r"trips", TripViewSet)

urlpatterns = [
    path("", include(router.urls)),
]