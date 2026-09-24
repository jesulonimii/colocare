import csv
import random
from pathlib import Path

random.seed(508)
data_dir = Path(__file__).resolve().parents[1] / "data"
fields = [
    "diseaseStage", "tumorLocation", "surgeryPerformed", "chemotherapyReceived", "chemotherapyCycles",
    "chemotherapyTiming", "radiotherapyReceived", "waterGlasses", "activityMinutes", "sleepHours",
    "stressLevel", "appetite", "bowelComfort", "fatigue", "symptomCount", "completionRate", "activityTrend", "fatigueTrend", "pattern", "focus", "progression",
]


def make_row():
    chemotherapy = random.random() < 0.58
    surgery = random.random() < 0.74
    fatigue = random.choices(["Low", "Moderate", "High"], [0.28, 0.48, 0.24])[0]
    bowel = random.choices(["Comfortable", "Occasional discomfort", "Persistent discomfort"], [0.34, 0.47, 0.19])[0]
    cycles = random.randint(4, 12) if chemotherapy else 0
    symptom_count = random.choices([0, 1, 2, 3], [0.35, 0.38, 0.2, 0.07])[0]
    water = random.randint(2, 10)
    activity = random.randint(10, 150)
    sleep = random.choice([5.5, 6, 6.5, 7, 7.5, 8])
    stress = random.randint(1, 5)
    appetite = random.choices(["Poor", "Fair", "Good"], [0.16, 0.5, 0.34])[0]
    completion_rate = round(random.uniform(0, 1), 2)
    activity_trend = random.randint(-30, 30)
    fatigue_trend = random.choice([-2, -1, 0, 0, 1, 2])
    # Treatment fields are retained as context, but the changing daily check-in drives the demo outcome.
    if bowel == "Persistent discomfort" or appetite == "Poor":
        pattern, focus = "bowel-comfort support pattern", "nutrition"
    elif fatigue == "High" or sleep <= 6 or stress >= 4:
        pattern, focus = "low-energy recovery pattern", "rest"
    elif activity < 45:
        pattern, focus = "low-activity recovery pattern", "movement"
    elif water < 5:
        pattern, focus = "hydration support pattern", "hydration"
    else:
        pattern, focus = "steady wellbeing pattern", "maintenance"
    if completion_rate >= 0.7 and activity_trend >= 0 and fatigue_trend <= 0:
        progression = "progress"
    elif completion_rate < 0.3 or fatigue_trend > 0:
        progression = "ease"
    else:
        progression = "maintain"
    return {
        "diseaseStage": random.choices(["Early", "Locally advanced", "Metastatic", "Unknown"], [0.36, 0.38, 0.12, 0.14])[0],
        "tumorLocation": random.choice(["Right colon", "Left colon", "Rectum", "Unknown"]),
        "surgeryPerformed": str(surgery), "chemotherapyReceived": str(chemotherapy), "chemotherapyCycles": cycles,
        "chemotherapyTiming": random.choice(["Before surgery", "After surgery", "Both"]) if chemotherapy else "Not applicable",
        "radiotherapyReceived": str(random.random() < 0.22), "waterGlasses": water,
        "activityMinutes": activity, "sleepHours": sleep,
        "stressLevel": stress, "appetite": appetite,
        "bowelComfort": bowel, "fatigue": fatigue, "symptomCount": symptom_count, "completionRate": completion_rate,
        "activityTrend": activity_trend, "fatigueTrend": fatigue_trend, "pattern": pattern, "focus": focus, "progression": progression,
    }


with (data_dir / "training.csv").open("w", newline="") as target:
    writer = csv.DictWriter(target, fieldnames=fields)
    writer.writeheader()
    writer.writerows(make_row() for _ in range(2400))
