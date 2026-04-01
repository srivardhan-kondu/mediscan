from __future__ import annotations

from pathlib import Path
import subprocess
import sys

BASE_DIR = Path(__file__).resolve().parents[1]
MODELS_DIR = BASE_DIR / "models"


def run(script: str) -> None:
    subprocess.run([sys.executable, str(BASE_DIR / "scripts" / script)], check=True)


def main() -> None:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    symptom_artifact = MODELS_DIR / "symptom_rf_pipeline.joblib"
    image_artifact = MODELS_DIR / "image_cnn_model.keras"
    labels_artifact = MODELS_DIR / "image_class_names.json"

    if not symptom_artifact.exists():
        run("train_symptom_model.py")

    if not image_artifact.exists() or not labels_artifact.exists():
        run("train_image_model.py")

    print("All model artifacts are ready.")


if __name__ == "__main__":
    main()
