from __future__ import annotations

import os
from pathlib import Path

from flask import Flask, jsonify, render_template, request

from app.ml.image_model import ImagePredictor
from app.ml.symptom_model import SymptomPredictor

BASE_DIR = Path(__file__).resolve().parent
MODELS_DIR = BASE_DIR / "models"

app = Flask(
    __name__,
    template_folder=str(BASE_DIR / "app" / "templates"),
    static_folder=str(BASE_DIR / "app" / "static"),
)

symptom_predictor = SymptomPredictor(MODELS_DIR / "symptom_rf_pipeline.joblib")
image_predictor = ImagePredictor(
    MODELS_DIR / "image_cnn_model.keras", MODELS_DIR / "image_class_names.json"
)

GUIDANCE = {
    "general": "This result is decision-support only and not a diagnosis.",
    "next_step": "Please consult a qualified doctor for accurate clinical advice.",
}


@app.get("/")
def home():
    return render_template("index.html")


@app.post("/api/predict/symptoms")
def predict_symptoms():
    payload = request.get_json(silent=True) or {}
    symptoms = payload.get("symptoms", "")

    if not isinstance(symptoms, str) or len(symptoms.strip()) < 3:
        return (
            jsonify(
                {
                    "ok": False,
                    "error": "Please enter valid symptoms (at least 3 characters).",
                }
            ),
            400,
        )

    try:
        pred = symptom_predictor.predict(symptoms)
        return jsonify({"ok": True, "source": "symptoms", "result": pred, "guidance": GUIDANCE})
    except Exception as exc:
        return jsonify({"ok": False, "error": str(exc)}), 500


@app.post("/api/predict/image")
def predict_image():
    if "image" not in request.files:
        return jsonify({"ok": False, "error": "Image file is required."}), 400

    uploaded = request.files["image"]
    if uploaded.filename == "":
        return jsonify({"ok": False, "error": "Please choose an image file."}), 400

    try:
        pred = image_predictor.predict(uploaded.stream)
        return jsonify({"ok": True, "source": "image", "result": pred, "guidance": GUIDANCE})
    except Exception as exc:
        return jsonify({"ok": False, "error": f"Image processing failed: {exc}"}), 400


@app.get("/api/health")
def health():
    return jsonify({"ok": True, "service": "MediScan", "status": "ready"})


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=int(os.getenv("PORT", "5000")), debug=True)
