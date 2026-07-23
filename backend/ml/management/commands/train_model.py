import os
import joblib
import pandas as pd

from django.core.management.base import BaseCommand
from sklearn.ensemble import RandomForestClassifier

from vehicles.models import Vehicle
from maintenance.models import MaintenanceRecord


class Command(BaseCommand):

    help = "Train ML Model using Maintenance Records"

    def handle(self, *args, **kwargs):

        data = []

        vehicles = Vehicle.objects.all()

        for vehicle in vehicles:

            maintenance_done = MaintenanceRecord.objects.filter(
                vehicle=vehicle,
                status="COMPLETED"
            ).exists()

            label = 1 if maintenance_done else 0

            data.append({

                "mileage": vehicle.mileage,
                "year": vehicle.manufacturing_year,
                "maintenance": label,

            })

        if len(data) < 5:

            self.stdout.write(
                self.style.ERROR(
                    "Add at least 5 vehicles."
                )
            )
            return

        df = pd.DataFrame(data)

        X = df[["mileage", "year"]]

        y = df["maintenance"]

        model = RandomForestClassifier(
            n_estimators=100,
            random_state=42
        )

        model.fit(X, y)

        os.makedirs("ml/model", exist_ok=True)

        joblib.dump(
            model,
            "ml/model/maintenance_model.pkl"
        )

        self.stdout.write(
            self.style.SUCCESS(
                "ML Model Retrained Successfully!"
            )
        )