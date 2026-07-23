import joblib
from django.shortcuts import get_object_or_404
from rest_framework.response import Response
from rest_framework.views import APIView

from vehicles.models import Vehicle
from maintenance.models import MaintenanceRecord

# Load trained ML model
model = joblib.load("ml/model/maintenance_model.pkl")


class PredictMaintenanceAPIView(APIView):

    def get(self, request):
        mileage = request.GET.get("mileage")
        year = request.GET.get("year")

        if mileage is None or year is None:
            return Response(
                {"error": "Please provide mileage and year."},
                status=400,
            )

        mileage = float(mileage)
        year = int(year)
        age = max(0, 2026 - year)

        prediction = model.predict([[mileage, age]])[0]

        if prediction == 1:
            result = "Maintenance Required"
            reason = "High cumulative mileage or vehicle age threshold reached."
        else:
            result = "No Maintenance Needed"
            reason = "Vehicle parameters indicate optimal health."

        return Response({
            "mileage": mileage,
            "year": year,
            "prediction": result,
            "reason": reason,
        })


class VehicleMaintenancePredictionAPIView(APIView):

    def get(self, request, vehicle_id):
        vehicle = get_object_or_404(Vehicle, id=vehicle_id)

        mileage = float(vehicle.mileage)
        year = int(vehicle.manufacturing_year)
        age = max(0, 2026 - year)

        prediction = model.predict([[mileage, age]])[0]

        # Check for completed and pending maintenance records
        recent_completed = MaintenanceRecord.objects.filter(
            vehicle=vehicle,
            status="COMPLETED"
        ).order_by("-service_date").first()

        has_pending = MaintenanceRecord.objects.filter(
            vehicle=vehicle,
            status="PENDING"
        ).exists()

        if has_pending:
            result = "Maintenance Required"
            reason = "Pending maintenance request logged for this vehicle."
        elif recent_completed:
            result = "No Maintenance Needed"
            reason = f"Servicing completed on {recent_completed.service_date} ({recent_completed.get_maintenance_type_display()})."
        elif prediction == 1:
            result = "Maintenance Required"
            reason = "High wear risk detected based on cumulative mileage and vehicle age."
        else:
            result = "No Maintenance Needed"
            reason = "Vehicle parameters indicate optimal health."

        return Response({
            "vehicle_id": vehicle.id,
            "registration_number": vehicle.registration_number,
            "vehicle_name": vehicle.vehicle_name,
            "mileage": mileage,
            "manufacturing_year": year,
            "prediction": result,
            "reason": reason,
            "recent_service_date": str(recent_completed.service_date) if recent_completed else None,
        })