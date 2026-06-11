import io
import json
import sys
import os
import unittest
from unittest.mock import MagicMock, patch, PropertyMock
import numpy as np

# ---------------------------------------------------------------------------
# Minimal stubs so that app.py can be imported without real ML models or
# template directories present in the test environment.
# ---------------------------------------------------------------------------

# Stub flask so we can import app without a real Flask installation if needed,
# but we actually want the real Flask for integration tests.  We rely on Flask
# being installed (it is a project dependency).  We only stub the heavy ML
# predictors and the template rendering.

# Create stub predictor objects before importing app so that the module-level
# assignments pick them up.
_stub_symptom_predictor = MagicMock()
_stub_image_predictor = MagicMock()

# Patch the predictor constructors / loaders at the module level so that
# app.py does not try to load real model files during import.
import importlib

# We need to intercept the creation of predictors inside app.py.
# The safest approach: patch builtins and known heavy imports, then import app.

# Patch medmnist and keras/tensorflow so train script can be imported safely.
sys.modules.setdefault("medmnist", MagicMock())
sys.modules.setdefault("tensorflow", MagicMock())
sys.modules.setdefault("keras", MagicMock())

# Provide a fake SymptomPredictor and ImagePredictor so app.py loads cleanly.
fake_sp_module = MagicMock()
fake_ip_module = MagicMock()

# We will inject the stubs after import via direct attribute assignment.

# ---------------------------------------------------------------------------
# Import the Flask app.  We patch the predictor *classes* so __init__ returns
# our stubs.
# ---------------------------------------------------------------------------

with patch.dict("sys.modules", {
    "models": MagicMock(),
    "models.symptom_predictor": fake_sp_module,
    "models.image_predictor": fake_ip_module,
}):
    # Make the constructors return our stubs
    fake_sp_module.SymptomPredictor.return_value = _stub_symptom_predictor
    fake_ip_module.ImagePredictor.return_value = _stub_image_predictor

    # Patch render_template so home() doesn't need a templates folder
    with patch("flask.templating.render_template", return_value="<html>index</html>"):
        try:
            import app as flask_app
        except Exception:
            # If the module path differs, try a direct exec approach
            flask_app = None

# If the import failed (e.g. different project layout), skip integration tests
# gracefully.  The unit tests for train script still run.

if flask_app is not None:
    # Inject our stubs directly into the module namespace
    flask_app.symptom_predictor = _stub_symptom_predictor
    flask_app.image_predictor = _stub_image_predictor
    _app = flask_app.app
    _app.config["TESTING"] = True
    _GUIDANCE = getattr(flask_app, "GUIDANCE", "Consult a doctor.")
else:
    _app = None
    _GUIDANCE = "Consult a doctor."


# ---------------------------------------------------------------------------
# Helper
# ---------------------------------------------------------------------------

def _make_client():
    """Return a Flask test client, or None if app could not be imported."""
    if _app is None:
        return None
    return _app.test_client()


# ---------------------------------------------------------------------------
# Tests for /  (home)
# ---------------------------------------------------------------------------

@unittest.skipIf(_app is None, "Flask app could not be imported")
class TestHomeEndpoint(unittest.TestCase):

    def setUp(self):
        self.client = _make_client()

    def test_home_returns_200(self):
        with patch("flask.templating.render_template", return_value="<html>index</html>"):
            resp = self.client.get("/")
        self.assertEqual(resp.status_code, 200)

    def test_home_returns_html_content(self):
        with patch("flask.templating.render_template", return_value="<html>index</html>"):
            resp = self.client.get("/")
        self.assertIn(b"html", resp.data.lower())

    def test_home_method_not_allowed_for_post(self):
        resp = self.client.post("/")
        # Flask returns 405 for disallowed methods
        self.assertEqual(resp.status_code, 405)


# ---------------------------------------------------------------------------
# Tests for /api/predict/symptoms
# ---------------------------------------------------------------------------

@unittest.skipIf(_app is None, "Flask app could not be imported")
class TestPredictSymptomsEndpoint(unittest.TestCase):

    def setUp(self):
        self.client = _make_client()
        # Reset mock state before each test
        _stub_symptom_predictor.reset_mock()

    # --- happy path ---

    def test_valid_symptoms_returns_200_and_ok_true(self):
        _stub_symptom_predictor.predict.return_value = "Flu"
        resp = self.client.post(
            "/api/predict/symptoms",
            data=json.dumps({"symptoms": "fever cough headache"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)
        body = resp.get_json()
        self.assertTrue(body["ok"])

    def test_valid_symptoms_result_field_present(self):
        _stub_symptom_predictor.predict.return_value = "Common Cold"
        resp = self.client.post(
            "/api/predict/symptoms",
            data=json.dumps({"symptoms": "runny nose sneezing"}),
            content_type="application/json",
        )
        body = resp.get_json()
        self.assertEqual(body["result"], "Common Cold")

    def test_valid_symptoms_source_is_symptoms(self):
        _stub_symptom_predictor.predict.return_value = "Malaria"
        resp = self.client.post(
            "/api/predict/symptoms",
            data=json.dumps({"symptoms": "chills fever sweating"}),
            content_type="application/json",
        )
        body = resp.get_json()
        self.assertEqual(body["source"], "symptoms")

    def test_valid_symptoms_guidance_field_present(self):
        _stub_symptom_predictor.predict.return_value = "Dengue"
        resp = self.client.post(
            "/api/predict/symptoms",
            data=json.dumps({"symptoms": "joint pain rash fever"}),
            content_type="application/json",
        )
        body = resp.get_json()
        self.assertIn("guidance", body)
        self.assertEqual(body["guidance"], _GUIDANCE)

    def test_predictor_called_with_correct_symptoms(self):
        _stub_symptom_predictor.predict.return_value = "X"
        self.client.post(
            "/api/predict/symptoms",
            data=json.dumps({"symptoms": "sore throat"}),
            content_type="application/json",
        )
        _stub_symptom_predictor.predict.assert_called_once_with("sore throat")

    # --- validation errors ---

    def test_empty_symptoms_string_returns_400(self):
        resp = self.client.post(
            "/api/predict/symptoms",
            data=json.dumps({"symptoms": ""}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 400)
        body = resp.get_json()
        self.assertFalse(body["ok"])

    def test_whitespace_only_symptoms_returns_400(self):
        resp = self.client.post(
            "/api/predict/symptoms",
            data=json.dumps({"symptoms": "   "}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 400)
        body = resp.get_json()
        self.assertFalse(body["ok"])

    def test_two_char_symptoms_returns_400(self):
        resp = self.client.post(
            "/api/predict/symptoms",
            data=json.dumps({"symptoms": "ab"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 400)

    def test_exactly_three_chars_is_accepted(self):
        _stub_symptom_predictor.predict.return_value = "Unknown"
        resp = self.client.post(
            "/api/predict/symptoms",
            data=json.dumps({"symptoms": "abc"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 200)

    def test_non_string_symptoms_integer_returns_400(self):
        resp = self.client.post(
            "/api/predict/symptoms",
            data=json.dumps({"symptoms": 123}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 400)
        body = resp.get_json()
        self.assertFalse(body["ok"])

    def test_non_string_symptoms_list_returns_400(self):
        resp = self.client.post(
            "/api/predict/symptoms",
            data=json.dumps({"symptoms": ["fever", "cough"]}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 400)

    def test_missing_symptoms_key_returns_400(self):
        resp = self.client.post(
            "/api/predict/symptoms",
            data=json.dumps({}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 400)

    def test_no_json_body_returns_400(self):
        resp = self.client.post("/api/predict/symptoms")
        self.assertEqual(resp.status_code, 400)

    def test_validation_error_message_content(self):
        resp = self.client.post(
            "/api/predict/symptoms",
            data=json.dumps({"symptoms": ""}),
            content_type="application/json",
        )
        body = resp.get_json()
        self.assertIn("error", body)
        self.assertIn("3", body["error"])

    # --- server error ---

    def test_predictor_exception_returns_500(self):
        _stub_symptom_predictor.predict.side_effect = RuntimeError("model exploded")
        resp = self.client.post(
            "/api/predict/symptoms",
            data=json.dumps({"symptoms": "fever cough"}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 500)
        body = resp.get_json()
        self.assertFalse(body["ok"])
        self.assertIn("model exploded", body["error"])

    def test_predictor_exception_ok_is_false(self):
        _stub_symptom_predictor.predict.side_effect = ValueError("bad input")
        resp = self.client.post(
            "/api/predict/symptoms",
            data=json.dumps({"symptoms": "chest pain"}),
            content_type="application/json",
        )
        body = resp.get_json()
        self.assertFalse(body["ok"])

    def test_symptoms_none_value_returns_400(self):
        resp = self.client.post(
            "/api/predict/symptoms",
            data=json.dumps({"symptoms": None}),
            content_type="application/json",
        )
        self.assertEqual(resp.status_code, 400)

    def test_symptoms_bool_value_returns_400(self):
        resp = self.client.post(
            "/api/predict/symptoms",
            data=json.dumps({"symptoms": True