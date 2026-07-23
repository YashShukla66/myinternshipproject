import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline

# Set seed for reproducible synthetic dataset generation
np.random.seed(42)

n_samples = 2500

# Synthetic dataset generation with realistic fleet ranges
mileage = np.random.uniform(1000, 350000, n_samples)
age = np.random.uniform(0.5, 30.0, n_samples) # 2026 - manufacturing_year
service_count = np.random.randint(0, 20, n_samples)
total_trip_distance = mileage * np.random.uniform(0.3, 0.95, n_samples)
days_since_last_service = np.random.uniform(5, 730, n_samples)

# Wear Risk Score calculation formula (Age & Mileage heavily weighted)
risk_score = (
    (mileage / 80000.0) * 0.40 +
    (age / 8.0) * 0.45 +
    (days_since_last_service / 180.0) * 0.25 +
    (total_trip_distance / 80000.0) * 0.10 -
    (service_count * 0.04)
)

# Convert to binary maintenance requirement label with sigmoid mapping
prob = 1 / (1 + np.exp(-(risk_score - 1.0) * 2.5))
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
    ("classifier", RandomForestClassifier(n_estimators=200, max_depth=10, random_state=42))
])

pipeline.fit(X, y)

# Save serialized ML model pipeline
os.makedirs("ml/model", exist_ok=True)
joblib.dump(pipeline, "ml/model/maintenance_model.pkl")

print(f"ML Pipeline retrained successfully on {n_samples} samples. Training Accuracy: {pipeline.score(X, y):.4f}")