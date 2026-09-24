import json
import re
from pathlib import Path

from fastapi import FastAPI
from pydantic import BaseModel, Field

from .model import load_or_train

app = FastAPI(title="ColoCare Recommendation Model", version="0.2.0-synthetic-demo")

data_dir = Path(__file__).resolve().parents[1] / "data"
catalog = json.loads((data_dir / "recommendation_catalog.json").read_text())
model = load_or_train(data_dir)


class Profile(BaseModel):
    diseaseStage: str = "Unknown"
    tumorLocation: str = "Unknown"
    surgeryPerformed: bool = False
    chemotherapyReceived: bool = False
    chemotherapyCycles: int = Field(default=0, ge=0, le=40)
    chemotherapyTiming: str = "Not applicable"
    radiotherapyReceived: bool = False
    survivorshipSymptoms: list[str] = []


class Assessment(BaseModel):
    waterGlasses: int = Field(ge=0, le=20)
    activityMinutes: int = Field(ge=0, le=1000)
    sleepHours: float = Field(ge=0, le=24)
    stressLevel: int = Field(ge=1, le=5)
    appetite: str
    bowelComfort: str
    fatigue: str
    symptoms: list[str] = []


class History(BaseModel):
    completionRate: float = Field(default=0.5, ge=0, le=1)
    activityTrend: float = Field(default=0)
    fatigueTrend: float = Field(default=0)


RED_FLAGS = {"Blood in stool", "Unexplained weight loss", "Persistent bloating"}


@app.get("/health")
def health():
    return {"status": "ok", "model": model["version"], "dataStatus": "synthetic demonstration data"}


@app.get("/starter-plan")
def starter_plan():
    labels = ["hydration", "movement", "rest"]
    return {
        "modelVersion": "starter",
        "items": [{"id": label, **catalog[label]} for label in labels],
        "reason": "A gentle starter plan while your daily check-ins build a fuller picture.",
    }


@app.post("/recommend")
def recommend(profile: Profile, assessment: Assessment, history: History):
    reported_symptoms = set(profile.survivorshipSymptoms) | set(assessment.symptoms)
    reported_flags = sorted(RED_FLAGS & reported_symptoms)
    if reported_flags:
        return {
            "modelVersion": model["version"],
            "triage": "urgent",
            "redFlags": reported_flags,
            "items": [],
            "reason": "You reported a symptom that needs prompt medical attention. Contact your oncology care team or seek urgent care now.",
        }
    prediction = model["predict"](profile.model_dump(), assessment.model_dump(), history.model_dump())
    labels = prediction["focuses"]
    if prediction["progression"] != "maintain" and "movement" not in labels:
        labels[-1] = "movement"
    items = [{"id": label, **catalog[label], "goals": [dict(goal) for goal in catalog[label]["goals"]]} for label in labels]
    if prediction["progression"] != "maintain":
        minutes = 15 if prediction["progression"] == "progress" else 5
        for item in items:
            if item["id"] == "movement":
                for goal in item["goals"]:
                    goal["title"] = re.sub(r"\d+-minute", f"{minutes}-minute", goal["title"])
    return {
        "modelVersion": model["version"],
        "triage": "routine",
        "pattern": prediction["pattern"],
        "confidence": prediction["confidence"],
        "progression": prediction["progression"],
        "items": items,
        "reason": f"Synthetic-data demonstration. Detected pattern: {prediction['pattern']} (model confidence {prediction['confidence']:.0%}). Recovery pace: {prediction['progression']}. This is illustrative, not clinical advice.",
    }
