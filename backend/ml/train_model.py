import pandas as pd
from sklearn.ensemble import RandomForestClassifier
import joblib

# Training dataset using mileage and vehicle_age (2026 - manufacturing_year)
data = pd.DataFrame({
    "mileage": [
        5000, 10000, 12000, 15000, 20000, 35000, 45000,
        55000, 75000, 90000, 120000, 150000, 180000
    ],
    "age": [
        1, 1, 2, 2, 3, 3, 4,
        5, 6, 7, 8, 9, 10
    ],
    "maintenance": [
        0, 0, 0, 0, 0, 0, 0,
        1, 1, 1, 1, 1, 1
    ]
})

X = data[["mileage", "age"]]
y = data["maintenance"]

model = RandomForestClassifier(n_estimators=100, random_state=42)
model.fit(X, y)

joblib.dump(model, "ml/model/maintenance_model.pkl")
print("Model retrained successfully.")