from django.conf import settings
from django.conf.urls.static import static
from django.contrib import admin
from django.urls import include, path

urlpatterns = [
    path("admin/", admin.site.urls),

    path("api/", include("vehicles.urls")),

    path("api/", include("drivers.urls")),

    path("api/", include("trips.urls")),

    path("api/", include("analytics_dashboard.urls")),

    path("api/", include("ml.urls")),

    path("api/", include("maintenance.urls")),

    path("api/", include("notifications.urls")),

    path("api/", include("reports.urls")),

    path("api/accounts/", include("accounts.urls")),
]

if settings.DEBUG:
    urlpatterns += static(
        settings.MEDIA_URL,
        document_root=settings.MEDIA_ROOT,
    )