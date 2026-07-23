import random
import jwt

from django.conf import settings
from django.contrib.auth.hashers import make_password
from django.core.mail import send_mail
from django.template.loader import render_to_string
from django.utils.html import strip_tags

from rest_framework import status
from rest_framework.permissions import AllowAny, IsAuthenticated
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import OTPVerification, User
from .serializers import RegisterSerializer, UserSerializer


def generate_otp():
    """Generate a random 6-digit OTP code."""
    return str(random.randint(100000, 999999))


def send_otp_email(email, otp):
    """Send the OTP verification email via Gmail SMTP."""
    subject = "🔐 FleetCore — Verify Your Email"
    html_message = f"""
    <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-radius: 16px; overflow: hidden; border: 1px solid #334155;">
        <div style="background: linear-gradient(135deg, #4f46e5, #7c3aed); padding: 32px 24px; text-align: center;">
            <h1 style="color: #ffffff; margin: 0; font-size: 28px; font-weight: 800; letter-spacing: -0.5px;">
                🚗 Fleet<span style="color: #c4b5fd;">Core</span>
            </h1>
            <p style="color: #e0e7ff; margin: 8px 0 0; font-size: 14px;">Email Verification</p>
        </div>
        <div style="padding: 32px 24px; text-align: center;">
            <p style="color: #94a3b8; font-size: 14px; margin: 0 0 24px;">
                Use the code below to verify your email address and complete your registration.
            </p>
            <div style="background: linear-gradient(135deg, #1e293b, #0f172a); border: 2px solid #4f46e5; border-radius: 12px; padding: 20px; margin: 0 auto; display: inline-block;">
                <span style="font-size: 36px; font-weight: 800; letter-spacing: 12px; color: #ffffff; font-family: 'Courier New', monospace;">
                    {otp}
                </span>
            </div>
            <p style="color: #64748b; font-size: 12px; margin: 20px 0 0;">
                ⏱ This code expires in <strong style="color: #f59e0b;">{settings.OTP_EXPIRY_MINUTES} minutes</strong>
            </p>
            <p style="color: #475569; font-size: 11px; margin: 16px 0 0;">
                If you didn't request this, please ignore this email.
            </p>
        </div>
        <div style="background: #0f172a; padding: 16px 24px; text-align: center; border-top: 1px solid #1e293b;">
            <p style="color: #475569; font-size: 10px; margin: 0;">
                © FleetCore Dashboard • Secure Registration
            </p>
        </div>
    </div>
    """
    plain_message = f"Your FleetCore verification code is: {otp}. It expires in {settings.OTP_EXPIRY_MINUTES} minutes."

    send_mail(
        subject=subject,
        message=plain_message,
        from_email=settings.DEFAULT_FROM_EMAIL,
        recipient_list=[email],
        html_message=html_message,
        fail_silently=False,
    )


class ProfileView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)


class RegisterView(APIView):
    """
    Step 1: Validate registration data, generate OTP, and send it via email.
    The user is NOT created yet — only after OTP verification.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegisterSerializer(data=request.data)
        if serializer.is_valid():
            email = serializer.validated_data.get("email")
            username = serializer.validated_data.get("username")
            password = serializer.validated_data.get("password")
            role = serializer.validated_data.get("role", "MANAGER")
            phone = serializer.validated_data.get("phone", "")

            # Check if username or email already exists
            if User.objects.filter(username=username).exists():
                return Response(
                    {"username": ["A user with this username already exists."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )
            if User.objects.filter(email=email).exists():
                return Response(
                    {"email": ["A user with this email already exists."]},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            # Invalidate any previous OTPs for this email
            OTPVerification.objects.filter(email=email, is_verified=False).delete()

            # Generate OTP and store pending registration
            otp = generate_otp()
            OTPVerification.objects.create(
                email=email,
                otp=otp,
                username=username,
                password_hash=make_password(password),
                role=role,
                phone=phone or "",
            )

            # Send OTP email
            try:
                send_otp_email(email, otp)
            except Exception as e:
                return Response(
                    {"error": f"Failed to send OTP email. Please check email configuration. Detail: {str(e)}"},
                    status=status.HTTP_500_INTERNAL_SERVER_ERROR,
                )

            return Response(
                {
                    "message": "OTP sent to your email address.",
                    "email": email,
                },
                status=status.HTTP_200_OK,
            )

        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class VerifyOTPView(APIView):
    """
    Step 2: Verify OTP and create the user account.
    Returns JWT tokens on success.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip()
        otp = request.data.get("otp", "").strip()

        if not email or not otp:
            return Response(
                {"error": "Email and OTP are required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Find the latest unverified OTP for this email
        otp_record = (
            OTPVerification.objects.filter(email=email, is_verified=False)
            .order_by("-created_at")
            .first()
        )

        if not otp_record:
            return Response(
                {"error": "No pending OTP found. Please register again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp_record.is_expired():
            otp_record.delete()
            return Response(
                {"error": "OTP has expired. Please request a new one."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        if otp_record.otp != otp:
            return Response(
                {"error": "Invalid OTP. Please try again."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # OTP is valid — create the user
        user = User.objects.create(
            username=otp_record.username,
            email=otp_record.email,
            password=otp_record.password_hash,  # Already hashed
            role=otp_record.role,
            phone=otp_record.phone or "",
        )

        # Mark OTP as verified and clean up
        otp_record.is_verified = True
        otp_record.save()

        # Generate JWT tokens
        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            },
            status=status.HTTP_201_CREATED,
        )


class ResendOTPView(APIView):
    """
    Resend a new OTP to the same email for a pending registration.
    """

    permission_classes = [AllowAny]

    def post(self, request):
        email = request.data.get("email", "").strip()

        if not email:
            return Response(
                {"error": "Email is required."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Find the latest unverified record
        otp_record = (
            OTPVerification.objects.filter(email=email, is_verified=False)
            .order_by("-created_at")
            .first()
        )

        if not otp_record:
            return Response(
                {"error": "No pending registration found for this email."},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Generate new OTP
        new_otp = generate_otp()
        otp_record.otp = new_otp
        otp_record.save()

        # Resend email
        try:
            send_otp_email(email, new_otp)
        except Exception as e:
            return Response(
                {"error": f"Failed to resend OTP email. Detail: {str(e)}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR,
            )

        return Response(
            {"message": "New OTP sent to your email address.", "email": email},
            status=status.HTTP_200_OK,
        )


class GoogleLoginView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        token = request.data.get("token") or request.data.get("credential")
        email = request.data.get("email")
        name = request.data.get("name") or "Google User"

        if token:
            try:
                decoded = jwt.decode(token, options={"verify_signature": False})
                email = decoded.get("email", email)
                name = decoded.get("name", name)
            except Exception:
                pass

        if not email:
            return Response(
                {"error": "Email is required for Google Authentication"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        # Find existing user by email or username
        username_candidate = email.split("@")[0]
        user = User.objects.filter(email=email).first()

        if not user:
            user = User.objects.filter(username=username_candidate).first()

        if not user:
            user = User.objects.create_user(
                username=username_candidate,
                email=email,
                role="MANAGER",
                first_name=name.split(" ")[0] if name else "",
                last_name=" ".join(name.split(" ")[1:]) if name and " " in name else "",
            )

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                "access": str(refresh.access_token),
                "refresh": str(refresh),
                "user": UserSerializer(user).data,
            }
        )