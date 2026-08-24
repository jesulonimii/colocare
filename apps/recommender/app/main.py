import json
from pathlib import Path
from fastapi import FastAPI
from pydantic import BaseModel, Field
from sklearn.neighbors import KNeighborsClassifier

app = FastAPI(title="ColoCare Recommendation Model", version="0.1.0")

data_dir = Path(__file__).resolve().parents[1] / "data"
training_set = json.loads((data_dir / "training_set.json").read_text())
catalog = json.loads((data_dir / "recommendation_catalog.json").read_text())
model = KNeighborsClassifier(n_neighbors=3, weights="distance").fit([record["features"] for record in training_set["records"]], [record["label"] for record in training_set["records"]])

class Assessment(BaseModel):
    waterGlasses: int = Field(ge=0, le=20)
    activityMinutes: int = Field(ge=0, le=1000)
    sleepHours: float = Field(ge=0, le=24)
    stressLevel: int = Field(ge=1, le=5)
    appetite: str
    bowelComfort: str
    fatigue: str

def code(value: str, choices: list[str]) -> int:
    return choices.index(value) + 1 if value in choices else 1

@app.get("/health")
def health(): return {"status": "ok", "model": training_set["version"]}

@app.get("/starter-plan")
def starter_plan():
    labels = ["hydration", "movement", "rest"]
    return {"modelVersion": "starter", "items": [{"id": label, **catalog[label]} for label in labels], "reason": "A gentle starter plan while your daily check-ins build a fuller picture."}

@app.post("/recommend")
def recommend(assessment: Assessment):
    features = [[assessment.waterGlasses, assessment.activityMinutes, assessment.sleepHours, assessment.stressLevel, code(assessment.appetite, ["Poor", "Fair", "Good"]), code(assessment.bowelComfort, ["Persistent discomfort", "Occasional discomfort", "Comfortable"]), code(assessment.fatigue, ["High", "Moderate", "Low"])]]
    probabilities = model.predict_proba(features)[0]
    ranked = [label for _, label in sorted(zip(probabilities, model.classes_), reverse=True)[:3]]
    return {"modelVersion": training_set["version"], "items": [{"id": label, **catalog[label]} for label in ranked], "confidence": round(float(max(probabilities)), 2)}
