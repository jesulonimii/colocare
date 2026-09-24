from pathlib import Path

from .model import save

output = save(Path(__file__).resolve().parents[1] / "data")
print(f"Trained synthetic-rf-v3-recovery-coach from data/training.csv and saved {output}")
