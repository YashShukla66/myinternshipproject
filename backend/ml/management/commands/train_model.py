import os
import joblib
import pandas as pd
import numpy as np
from django.core.management.base import BaseCommand
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from django.utils import timezone

from vehicles.models import Vehicle
from maintenance.models import MaintenanceRecord
from trips.models import Trip


class Command(BaseCommand):
    help = "Train ML Model using fleet telemetry and historical maintenance records"

    def handle(self, *args, **kwargs):
        vehicles = Vehicle.objects.all()
        if vehicles.count() < 1:
            self.stdout.write(self.style.ERROR("No vehicles found in database."))
            return

        data = []
        now = timezone.now().date()

        for vehicle in vehicles:
            mileage = float(vehicle.mileage)
            age = float(max(0, 2026 - vehicle.manufacturing_year))
            service_count = MaintenanceRecord.objects.filter(vehicle=vehicle).count()
            
            trips = Trip.objects.filter(vehicle=vehicle, status="COMPLETED")
            total_trip_distance = sum(t.distance for t in trips)

            recent_completed = MaintenanceRecord.objects.filter(
                vehicle=vehicle, status="COMPLETED"
            ).order_by("-service_date").first()

            if recent_completed:
                days_since_last_service = (now - recent_completed.service_date).days
            else:
                days_since_last_service = int(age * 365)

            has_pending = MaintenanceRecord.objects.filter(vehicle=vehicle, status="PENDING").exists()
            label = 1 if (has_pending or mileage > 60000 or age > 5 or days_since_last_service > 180) else 0

            data.append({
                "mileage": mileage,
                "age": age,
                "service_count": service_count,
                "total_trip_distance": total_trip_distance,
                "days_since_last_service": days_since_last_service,
                "maintenance": label
            })

        # Augment with synthetic samples if DB count is small
        if len(data) < 200:
            np.random.seed(42)
            n_synth = 1000
            s_mileage = np.random.uniform(2000, 250000, n_synth)
            s_age = np.random.uniform(0.5, 12.0, n_synth)
            s_service_count = np.random.randint(0, 15, n_synth)
            s_total_trip = s_mileage * np.random.uniform(0.4, 0.9, n_synth)
            s_days = np.random.uniform(10, 600, n_synth)
            
            s_risk = (
                (s_mileage / 120000) * 0.35 +
                (s_age / 8.0) * 0.25 +
                (s_days / 180.0) * 0.25 +
                (s_total_trip / 100000) * 0.15 -
                (s_service_count * 0.05)
            )
            s_prob = 1 / (1 + np.exp(-(s_risk - 1.1) * 3))
            s_label = (np.random.uniform(0, 1, n_synth) < s_prob).astype(int)

            for i in range(n_synth):
                data.append({
                    "mileage": s_mileage[i],
                    "age": s_age[i],
                    "service_count": s_service_count[i],
                    "total_trip_distance": s_total_trip[i],
                    "days_since_last_service": s_days[i],
                    "maintenance": s_label[i]
                })

        df = pd.DataFrame(data)
        X = df[["mileage", "age", "service_count", "total_trip_distance", "days_since_last_service"]]
        y = df["maintenance"]

        pipeline = Pipeline([
            ("scaler", StandardScaler()),
            ("classifier", RandomForestClassifier(n_estimators=150, max_depth=8, random_state=42))
        ])

        pipeline.fit(X, y)

        os.makedirs("ml/model", exist_ok=True)
        joblib.dump(pipeline, "ml/model/maintenance_model.pkl")

        self.stdout.write(
            self.style.SUCCESS(
                f"ML Model Pipeline Retrained Successfully on {len(df)} samples! Accuracy: {pipeline.score(X, y):.4f}"
            )
        )