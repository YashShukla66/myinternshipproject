import os
import joblib
from datetime import date
from django.shortcuts import get_object_or_404
from django.utils import timezone
from rest_framework.response import Response
from rest_framework.views import APIView

from vehicles.models import Vehicle
from maintenance.models import MaintenanceRecord
from trips.models import Trip

# Load trained ML pipeline
MODEL_PATH = "ml/model/maintenance_model.pkl"

def get_ml_model():
    if os.path.exists(MODEL_PATH):
        try:
            return joblib.load(MODEL_PATH)
        except Exception:
            pass
    return None

model = get_ml_model()


def compute_prediction_details(mileage, year, service_count=0, total_trip_distance=0, days_since_last_service=30):
    age = max(0.5, float(2026 - year))
    mileage = float(mileage)
    service_count = float(service_count)
    total_trip_distance = float(total_trip_distance)
    days_since_last_service = float(days_since_last_service)

    feature_vector = [[mileage, age, service_count, total_trip_distance, days_since_last_service]]

    if model is not None:
        try:
            proba = model.predict_proba(feature_vector)[0]
            prob_required = float(proba[1])
        except Exception:
            # Fallback heuristic if model shape mismatch
            risk_score = (mileage / 100000) * 0.4 + (age / 8.0) * 0.3 + (days_since_last_service / 180.0) * 0.3
            prob_required = min(0.99, max(0.01, 1 / (1 + math.exp(-risk_score + 1.2))))
    else:
        # Heuristic calculation if model file not available
        risk_score = (mileage / 100000) * 0.4 + (age / 8.0) * 0.3 + (days_since_last_service / 180.0) * 0.3
        prob_required = min(0.99, max(0.05, risk_score / 2.5))

    probability_percentage = round(prob_required * 100, 1)

    if probability_percentage >= 75.0:
        risk_level = "Critical"
        prediction = "Maintenance Required"
        reason = f"High wear probability ({probability_percentage}%) detected. Extreme mileage and service gap thresholds exceeded."
        recommended_action = "Immediate workshop service and engine overhaul required."
        estimated_cost = 1200
    elif probability_percentage >= 50.0:
        risk_level = "High"
        prediction = "Maintenance Required"
        reason = f"Elevated maintenance risk ({probability_percentage}%). Cumulative mileage and age indicate upcoming wear."
        recommended_action = "Schedule preventive maintenance inspection within 7 days."
        estimated_cost = 650
    elif probability_percentage >= 25.0:
        risk_level = "Moderate"
        prediction = "No Immediate Maintenance Needed"
        reason = f"Moderate telemetry wear ({probability_percentage}%). Standard maintenance interval approaching."
        recommended_action = "Perform routine fluid and brake check during next scheduled checkup."
        estimated_cost = 250
    else:
        risk_level = "Optimal"
        prediction = "No Immediate Maintenance Needed"
        reason = f"Optimal health score ({probability_percentage}% failure risk). Vehicle components within ideal tolerance."
        recommended_action = "Continue regular operational trips. Vehicle in peak condition."
        estimated_cost = 0

    # Feature Wear Factor percentages
    total_impact = (mileage / 1000) + (age * 15) + (days_since_last_service * 0.5) + 1.0
    mileage_wear = round(((mileage / 1000) / total_impact) * 100, 1)
    age_wear = round(((age * 15) / total_impact) * 100, 1)
    service_gap_wear = round(((days_since_last_service * 0.5) / total_impact) * 100, 1)

    return {
        "mileage": mileage,
        "year": int(year),
        "age": age,
        "service_count": int(service_count),
        "total_trip_distance": total_trip_distance,
        "days_since_last_service": days_since_last_service,
        "failure_probability": probability_percentage,
        "risk_level": risk_level,
        "prediction": prediction,
        "reason": reason,
        "recommended_action": recommended_action,
        "estimated_cost": estimated_cost,
        "wear_breakdown": {
            "mileage_impact": mileage_wear,
            "age_impact": age_wear,
            "service_gap_impact": service_gap_wear
        }
    }


class PredictMaintenanceAPIView(APIView):
    def get(self, request):
        mileage = request.GET.get("mileage")
        year = request.GET.get("year")

        if mileage is None or year is None:
            return Response(
                {"error": "Please provide mileage and year."},
                status=400,
            )

        try:
            mileage = float(mileage)
            year = int(year)
        except ValueError:
            return Response({"error": "Invalid numerical parameters provided."}, status=400)

        details = compute_prediction_details(mileage=mileage, year=year)
        return Response(details)


class VehicleMaintenancePredictionAPIView(APIView):
    def get(self, request, vehicle_id):
        vehicle = get_object_or_404(Vehicle, id=vehicle_id)

        mileage = float(vehicle.mileage)
        year = int(vehicle.manufacturing_year)
        now = timezone.now().date()

        # Database telemetry aggregates
        service_count = MaintenanceRecord.objects.filter(vehicle=vehicle).count()
        trips = Trip.objects.filter(vehicle=vehicle, status="COMPLETED")
        total_trip_distance = sum(t.distance for t in trips)

        recent_completed = MaintenanceRecord.objects.filter(
            vehicle=vehicle,
            status="COMPLETED"
        ).order_by("-service_date").first()

        if recent_completed:
            days_since_last_service = (now - recent_completed.service_date).days
        else:
            days_since_last_service = int((2026 - year) * 365 / 2)

        has_pending = MaintenanceRecord.objects.filter(
            vehicle=vehicle,
            status="PENDING"
        ).exists()

        details = compute_prediction_details(
            mileage=mileage,
            year=year,
            service_count=service_count,
            total_trip_distance=total_trip_distance,
            days_since_last_service=days_since_last_service
        )

        if has_pending:
            details["prediction"] = "Maintenance Required"
            details["risk_level"] = "Critical" if details["failure_probability"] > 60 else "High"
            details["reason"] = "Active pending maintenance request logged in system for this vehicle."

        details["vehicle_id"] = vehicle.id
        details["registration_number"] = vehicle.registration_number
        details["vehicle_name"] = vehicle.vehicle_name
        details["vehicle_type"] = vehicle.vehicle_type
        details["status"] = vehicle.status
        details["recent_service_date"] = str(recent_completed.service_date) if recent_completed else "No previous record"

        return Response(details)