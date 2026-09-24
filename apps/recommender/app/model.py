import csv
from pathlib import Path

import joblib
from sklearn.ensemble import RandomForestClassifier
from sklearn.feature_extraction import DictVectorizer
from sklearn.pipeline import Pipeline

FEATURES = [
    "diseaseStage", "tumorLocation", "surgeryPerformed", "chemotherapyReceived", "chemotherapyCycles",
    "chemotherapyTiming", "radiotherapyReceived", "waterGlasses", "activityMinutes", "sleepHours",
    "stressLevel", "appetite", "bowelComfort", "fatigue", "symptomCount", "completionRate", "activityTrend", "fatigueTrend",
]
NUMERIC = {"chemotherapyCycles", "waterGlasses", "activityMinutes", "sleepHours", "stressLevel", "symptomCount", "completionRate", "activityTrend", "fatigueTrend"}


def row_for(profile: dict, assessment: dict, history: dict) -> dict:
    row = {
        **{key: profile.get(key, "Unknown") for key in FEATURES[:7]},
        **{key: assessment.get(key) for key in FEATURES[7:-1]},
        "symptomCount": len(set(profile.get("survivorshipSymptoms", [])) | set(assessment.get("symptoms", []))),
        "completionRate": history.get("completionRate", 0.5),
        "activityTrend": history.get("activityTrend", 0),
        "fatigueTrend": history.get("fatigueTrend", 0),
    }
    return {key: value if key in NUMERIC else str(value) for key, value in row.items()}


def build_pipeline() -> Pipeline:
    return Pipeline([
        ("prepare", DictVectorizer(sparse=False)),
        ("model", RandomForestClassifier(n_estimators=240, min_samples_leaf=2, max_features=1.0, random_state=508)),
    ])


def fit(data_dir: Path):
    with (data_dir / "training.csv").open(newline="") as source:
        rows = list(csv.DictReader(source))
    features = [{key: float(row[key]) if key in NUMERIC else row[key] for key in FEATURES} for row in rows]
    pattern = build_pipeline().fit(features, [row["pattern"] for row in rows])
    focus = build_pipeline().fit(features, [row["focus"] for row in rows])
    progression = build_pipeline().fit(features, [row["progression"] for row in rows])

    return pattern, focus, progression


def make_model(pattern, focus, progression) -> dict:
    def predict(profile: dict, assessment: dict, history: dict) -> dict:
        row = row_for(profile, assessment, history)
        probabilities = focus.predict_proba([row])[0]
        ranked = [str(label) for _, label in sorted(zip(probabilities, focus.classes_), reverse=True)[:3]]
        pattern_probabilities = pattern.predict_proba([row])[0]
        pattern_index = int(pattern_probabilities.argmax())
        return {
            "pattern": str(pattern.classes_[pattern_index]),
            "confidence": round(float(pattern_probabilities[pattern_index]), 2),
            "focuses": ranked,
            "progression": str(progression.predict([row])[0]),
        }

    return {"version": "synthetic-rf-v3-recovery-coach", "predict": predict}


def train(data_dir: Path) -> dict:
    return make_model(*fit(data_dir))


def save(data_dir: Path) -> str:
    pattern, focus, progression = fit(data_dir)
    output = data_dir / "model.joblib"
    joblib.dump({"pattern": pattern, "focus": focus, "progression": progression}, output)
    return str(output)


def load_or_train(data_dir: Path) -> dict:
    output = data_dir / "model.joblib"
    if output.exists():
        saved = joblib.load(output)
        return make_model(saved["pattern"], saved["focus"], saved["progression"])
    return train(data_dir)
