import os
import joblib
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestClassifier, GradientBoostingClassifier
from sklearn.preprocessing import StandardScaler
from sklearn.pipeline import Pipeline
from sklearn.model_selection import train_test_split, cross_val_score
from sklearn.metrics import classification_report, accuracy_score

# Set seed for reproducible synthetic dataset generation
np.random.seed(42)

n_samples = 3000

# ── Synthetic dataset generation with realistic fleet ranges ──
# Mileage = fuel efficiency in km/L (10–100 range, NOT total distance)
mileage = np.random.uniform(10, 100, n_samples)  # km per litre
age = np.random.uniform(0.5, 25.0, n_samples)     # vehicle age in years
service_count = np.random.randint(0, 20, n_samples)
total_trip_distance = np.random.uniform(500, 200000, n_samples)  # cumulative km driven
days_since_last_service = np.random.uniform(5, 730, n_samples)

# ── Wear / Risk Score ──
# Low fuel efficiency → higher wear; high age & service gap → higher risk
risk_score = (
    ((100 - mileage) / 90.0) * 0.25 +   # lower efficiency = more wear
    (age / 8.0) * 0.35 +                 # older vehicle = more risk
    (days_since_last_service / 180.0) * 0.20 +
    (total_trip_distance / 100000.0) * 0.15 -
    (service_count * 0.04)
)

# Convert to binary maintenance label via sigmoid mapping
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

FEATURES = ["mileage", "age", "service_count", "total_trip_distance", "days_since_last_service"]
X = df[FEATURES]
y = df["maintenance"]

# ── Train / Test Split ──
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, random_state=42, stratify=y
)

# ── ML Pipeline: StandardScaler → Random Forest Classifier ──
pipeline = Pipeline([
    ("scaler", StandardScaler()),
    ("classifier", RandomForestClassifier(
        n_estimators=250,
        max_depth=12,
        min_samples_split=5,
        min_samples_leaf=3,
        random_state=42,
        class_weight="balanced"
    ))
])

pipeline.fit(X_train, y_train)

# ── Evaluation ──
y_pred = pipeline.predict(X_test)
train_acc = pipeline.score(X_train, y_train)
test_acc = accuracy_score(y_test, y_pred)

cv_scores = cross_val_score(pipeline, X, y, cv=5, scoring="accuracy")

print("=" * 60)
print("  Fleet Maintenance ML Model — Training Report")
print("=" * 60)
print(f"  Samples       : {n_samples} (train={len(X_train)}, test={len(X_test)})")
print(f"  Features       : {FEATURES}")
print(f"  Train Accuracy : {train_acc:.4f}")
print(f"  Test  Accuracy : {test_acc:.4f}")
print(f"  5-Fold CV Mean : {cv_scores.mean():.4f} ± {cv_scores.std():.4f}")
print("-" * 60)
print("  Classification Report (Test Set):")
print(classification_report(y_test, y_pred, target_names=["No Maintenance", "Maintenance Needed"]))

# Feature importances
rf = pipeline.named_steps["classifier"]
importances = rf.feature_importances_
print("  Feature Importances:")
for feat, imp in sorted(zip(FEATURES, importances), key=lambda x: -x[1]):
    print(f"    {feat:30s} {imp:.4f}")
print("=" * 60)

# ── Persist model ──
os.makedirs("ml/model", exist_ok=True)
joblib.dump(pipeline, "ml/model/maintenance_model.pkl")
print(f"\n  [OK] Model saved to ml/model/maintenance_model.pkl")