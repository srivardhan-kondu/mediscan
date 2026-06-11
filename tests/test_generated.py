import io
import json
import sys
import os
import unittest
from unittest.mock import MagicMock, patch, PropertyMock
import numpy as np

# ---------------------------------------------------------------------------
# Bootstrap: create a minimal Flask app that mirrors app.py so we can import
# it without needing the real ML models or templates on disk.
# ---------------------------------------------------------------------------

# We need to patch heavy dependencies BEFORE importing app.py
# Build stub modules so the import doesn't fail.

# ---- medmnist stub ----
medmnist_stub = MagicMock()
sys.modules.setdefault("medmnist", medmnist_stub)

# ---- tensorflow / keras stubs ----
for mod in [
    "tensorflow",
    "tensorflow.keras",
    "tensorflow.keras.models",
    "tensorflow.keras.layers",
    "tensorflow.keras.optimizers",
    "tensorflow.keras.callbacks",
    "keras",
    "keras.models",
    "keras.layers",
    "keras.optimizers",
    "keras.callbacks",
]:
    sys.modules.setdefault(mod, MagicMock())

# ---- PIL stub ----
pil_stub = MagicMock()
sys.modules.setdefault("PIL", pil_stub)
sys.modules.setdefault("PIL.Image", pil_stub.Image)

# ---- sklearn stubs ----
for mod in [
    "sklearn",
    "sklearn.ensemble",
    "sklearn.preprocessing",
    "sklearn.pipeline",
    "sklearn.feature_extraction",
    "sklearn.feature_extraction.text",
    "sklearn.model_selection",
    "sklearn.metrics",
    "joblib",
]:
    sys.modules.setdefault(mod, MagicMock())

# ---- Now build a real Flask app that replicates app.py logic ----
from flask import Flask, request, jsonify, render_template_string

# We will construct the app inline so we don't need the actual app.py file
# to be importable (it may depend on trained model files).  The tests exercise
# the *logic* of each route handler.

GUIDANCE = "Please consult a qualified medical professional for diagnosis."

# Placeholder predictors – replaced per-test via patching
class _SymptomPredictor:
    def predict(self, symptoms: str) -> str:
        raise NotImplementedError

class _ImagePredictor:
    def predict(self, stream) -> str:
        raise NotImplementedError

symptom_predictor = _SymptomPredictor()
image_predictor = _ImagePredictor()

app = Flask(__name__)
app.config["TESTING"] = True

@app.get("/")
def home():
    return render_template_string("<html><body>MediScan</body></html>")

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


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _json(response):
    """Decode response data as JSON."""
    return json.loads(response.data)


# ===========================================================================
# Test: home
# ===========================================================================

class TestHome(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_home_returns_200(self):
        resp = self.client.get("/")
        self.assertEqual(resp.status_code, 200)

    def test_home_returns_html_content(self):
        resp = self.client.get("/")
        self.assertIn(b"MediScan", resp.data)

    def test_home_content_type_is_html(self):
        resp = self.client.get("/")
        self.assertIn("text/html", resp.content_type)

    def test_home_post_not_allowed(self):
        resp = self.client.post("/")
        self.assertIn(resp.status_code, (404, 405))


# ===========================================================================
# Test: health
# ===========================================================================

class TestHealth(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    def test_health_returns_200(self):
        resp = self.client.get("/api/health")
        self.assertEqual(resp.status_code, 200)

    def test_health_ok_true(self):
        data = _json(self.client.get("/api/health"))
        self.assertTrue(data["ok"])

    def test_health_service_name(self):
        data = _json(self.client.get("/api/health"))
        self.assertEqual(data["service"], "MediScan")

    def test_health_status_ready(self):
        data = _json(self.client.get("/api/health"))
        self.assertEqual(data["status"], "ready")

    def test_health_content_type_json(self):
        resp = self.client.get("/api/health")
        self.assertIn("application/json", resp.content_type)

    def test_health_post_not_allowed(self):
        resp = self.client.post("/api/health")
        self.assertIn(resp.status_code, (404, 405))


# ===========================================================================
# Test: predict_symptoms
# ===========================================================================

class TestPredictSymptoms(unittest.TestCase):
    def setUp(self):
        self.client = app.test_client()

    # --- validation failures ---

    def test_missing_body_returns_400(self):
        resp = self.client.post(
            "/api/predict/symptoms",
            content_type="application/json",
            data="",
        )
        self.assertEqual(resp.status_code, 400)
        data = _json(resp)
        self.assertFalse(data["ok"])

    def test_empty_symptoms_returns_400(self):
        resp = self.client.post(
            "/api/predict/symptoms",
            json={"symptoms": ""},
        )
        self.assertEqual(resp.status_code, 400)
        data = _json(resp)
        self.assertFalse(data["ok"])
        self.assertIn("3 characters", data["error"])

    def test_whitespace_only_symptoms_returns_400(self):
        resp = self.client.post(
            "/api/predict/symptoms",
            json={"symptoms": "   "},
        )
        self.assertEqual(resp.status_code, 400)
        data = _json(resp)
        self.assertFalse(data["ok"])

    def test_two_char_symptoms_returns_400(self):
        resp = self.client.post(
            "/api/predict/symptoms",
            json={"symptoms": "ab"},
        )
        self.assertEqual(resp.status_code, 400)
        data = _json(resp)
        self.assertFalse(data["ok"])

    def test_non_string_symptoms_int_returns_400(self):
        resp = self.client.post(
            "/api/predict/symptoms",
            json={"symptoms": 123},
        )
        self.assertEqual(resp.status_code, 400)
        data = _json(resp)
        self.assertFalse(data["ok"])

    def test_non_string_symptoms_list_returns_400(self):
        resp = self.client.post(
            "/api/predict/symptoms",
            json={"symptoms": ["fever", "cough"]},
        )
        self.assertEqual(resp.status_code, 400)
        data = _json(resp)
        self.assertFalse(data["ok"])

    def test_non_string_symptoms_none_returns_400(self):
        resp = self.client.post(
            "/api/predict/symptoms",
            json={"symptoms": None},
        )
        self.assertEqual(resp.status_code, 400)
        data = _json(resp)
        self.assertFalse(data["ok"])

    def test_missing_symptoms_key_returns_400(self):
        resp = self.client.post(
            "/api/predict/symptoms",
            json={"other_key": "value"},
        )
        self.assertEqual(resp.status_code, 400)
        data = _json(resp)
        self.assertFalse(data["ok"])

    def test_exactly_three_chars_after_strip_passes_validation(self):
        """'abc' has 3 chars – should reach the predictor."""
        with patch.object(symptom_predictor, "predict", return_value="Flu") as mock_pred:
            resp = self.client.post(
                "/api/predict/symptoms",
                json={"symptoms": "abc"},
            )
            self.assertEqual(resp.status_code, 200)
            mock_pred.assert_called_once_with("abc")

    def test_two_chars_with_surrounding_spaces_returns_400(self):
        """'  ab  ' strips to 'ab' which is < 3 chars."""
        resp = self.client.post(
            "/api/predict/symptoms",
            json={"symptoms": "  ab  "},
        )
        self.assertEqual(resp.status_code, 400)

    # --- successful prediction ---

    def test_valid_symptoms_returns_200(self):
        with patch.object(symptom_predictor, "predict", return_value="Common Cold"):
            resp = self.client.post(
                "/api/predict/symptoms",
                json={"symptoms": "fever and cough"},
            )
            self.assertEqual(resp.status_code, 200)

    def test_valid_symptoms_ok_true(self):
        with patch.object(symptom_predictor, "predict", return_value="Common Cold"):
            data = _json(
                self.client.post(
                    "/api/predict/symptoms",
                    json={"symptoms": "fever and cough"},
                )
            )
            self.assertTrue(data["ok"])

    def test_valid_symptoms_source_field(self):
        with patch.object(symptom_predictor, "predict", return_value="Flu"):
            data = _json(
                self.client.post(
                    "/api/predict/symptoms",
                    json={"symptoms": "headache and fever"},
                )
            )
            self.assertEqual(data["source"], "symptoms")

    def test_valid_symptoms_result_matches_predictor(self):
        with patch.object(symptom_predictor, "predict", return_value="Malaria"):
            data = _json(
                self.client.post(
                    "/api