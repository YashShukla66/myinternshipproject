from django.urls import path
from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import (
    GoogleLoginView,
    ProfileView,
    RegisterView,
    ResendOTPView,
    VerifyOTPView,
)

urlpatterns = [
    path("login/", TokenObtainPairView.as_view(), name="login"),
    path("register/", RegisterView.as_view(), name="register"),
    path("verify-otp/", VerifyOTPView.as_view(), name="verify-otp"),
    path("resend-otp/", ResendOTPView.as_view(), name="resend-otp"),
    path("google-login/", GoogleLoginView.as_view(), name="google-login"),
    path("refresh/", TokenRefreshView.as_view(), name="refresh"),
    path("profile/", ProfileView.as_view(), name="profile"),
]