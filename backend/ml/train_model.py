import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# Set seed for reproducible synthetic dataset generation
np.random.seed(42)

n_samples = 1500

# Synthetic dataset generation based on real fleet domain mechanics
mileage = np.random.uniform(2000, 250000, n_samples)
age = np.random.uniform(0.5, 12.0, n_samples)
service_count = np.random.randint(0, 15, n_samples)
total_trip_distance = mileage * np.random.uniform(0.4, 0.9, n_samples)
days_since_last_service = np.random.uniform(10, 600, n_samples)

# Wear Risk Score calculation formula incorporating multi-variable telemetry
risk_score = (
    (mileage / 120000) * 0.35 +
    (age / 8.0) * 0.25 +
    (days_since_last_service / 180.0) * 0.25 +
    (total_trip_distance / 100000) * 0.15 -
    (service_count * 0.05)
)

# Convert to binary maintenance requirement label with logistic sigmoid mapping
prob = 1 / (1 + np.exp(-(risk_score - 1.1) * 3))
maintenance = (np.random.uniform(0, 1, n_samples) < prob).astype(int)

df = pd.DataFrame({
    "mileage": mileage,
    "age": age,
    "service_count": service_count,
    "total_trip_distance": total_trip_distance,
    "days_since_last_service": days_since_last_service,
    "maintenance": maintenance
})

X = df[["mileage", "age", "service_count", "total_trip_distance", "days_since_last_service"]]
y = df["maintenance"]

# Train ML Pipeline with feature scaling and Random Forest Classifier
pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("classifier", RandomForestClassifier(n_estimators=150, max_depth=8, random_state=42))
])

pipeline.fit(X, y)

# Save serialized ML model pipeline
os.makedirs("ml/model", exist_ok=True)
joblib.dump(pipeline, "ml/model/maintenance_model.pkl")

print(f"ML Pipeline trained successfully on {n_samples} samples. Training Accuracy: {pipeline.score(X, y):.4f}")