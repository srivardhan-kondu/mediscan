from __future__ import annotations

from pathlib import Path
from typing import Any

import joblib
import numpy as np


class SymptomPredictor:
    """Loads and serves the symptom-based RandomForest pipeline.

    Uses keyword matching to convert user free-text into a binary symptom
    vector, then feeds it to the Random Forest trained on binary features.
    TF-IDF is used as a preprocessing step for keyword extraction (FR4).
    """

    # Map common user phrases to dataset column names
    SYNONYMS: dict[str, str] = {
        "fever": "high_fever",
        "temperature": "high_fever",
        "sore throat": "throat_irritation",
        "runny nose": "runny_nose",
        "stuffy nose": "congestion",
        "itchy": "itching",
        "itch": "itching",
        "rash": "skin_rash",
        "tired": "fatigue",
        "tiredness": "fatigue",
        "dizzy": "dizziness",
        "throwing up": "vomiting",
        "puke": "vomiting",
        "stomach ache": "stomach_pain",
        "tummy pain": "belly_pain",
        "short of breath": "breathlessness",
        "difficulty breathing": "breathlessness",
        "overweight": "obesity",
        "peeing a lot": "polyuria",
        "frequent urination": "polyuria",
        "blurry vision": "blurred_and_distorted_vision",
        "blurred vision": "blurred_and_distorted_vision",
        "weight gain": "weight_gain",
        "weight loss": "weight_loss",
        "sneezing": "continuous_sneezing",
        "stiffness": "movement_stiffness",
        "stiff": "movement_stiffness",
        "swollen joints": "swelling_joints",
        "swollen lymph nodes": "swelled_lymph_nodes",
        "swelling": "swelling_joints",
        "joint swelling": "swelling_joints",
        "muscle weakness": "muscle_weakness",
        "weak muscles": "muscle_weakness",
        "muscle pain": "muscle_pain",
        "body pain": "muscle_pain",
        "body ache": "muscle_pain",
        "sensitivity to light": "visual_disturbances",
        "light sensitivity": "visual_disturbances",
        "depression": "depression",
        "irritable": "irritability",
        "hungry": "excessive_hunger",
        "indigestion": "indigestion",
        "acidity": "acidity",
        "yellow skin": "yellowish_skin",
        "dark urine": "dark_urine",
        "stomach bloating": "swelling_of_stomach",
        "constipation": "constipation",
        "diarrhoea": "diarrhoea",
        "diarrhea": "diarrhoea",
        "chills": "chills",
        "red spots": "red_spots_over_body",
        "back pain": "back_pain",
        "neck pain": "neck_pain",
        "knee pain": "knee_pain",
        "hip pain": "hip_joint_pain",
        "painful walking": "painful_walking",
        "difficulty walking": "painful_walking",
        "anxiety": "anxiety",
        "restless": "restlessness",
        "restlessness": "restlessness",
        "lethargy": "lethargy",
        "sluggish": "lethargy",
    }

    def __init__(self, artifact_path: str | Path) -> None:
        self.artifact_path = Path(artifact_path)
        self.model = None
        self.labels: list[str] = []
        self.symptom_cols: list[str] = []
        self.vocab: dict[str, list[str]] = {}
        self.tfidf = None
        self._load()

    def _load(self) -> None:
        if not self.artifact_path.exists():
            raise FileNotFoundError(
                f"Symptom model artifact not found at {self.artifact_path}."
            )

        payload: dict[str, Any] = joblib.load(self.artifact_path)
        self.model = payload["model"]
        self.labels = payload["labels"]
        self.symptom_cols = payload["symptom_cols"]
        self.vocab = payload["vocab"]
        self.tfidf = payload["tfidf"]

    def _expand_synonyms(self, text: str) -> str:
        """Replace common user phrases with dataset column names (whole-word only)."""
        import re
        result = text
        # Sort by length (longest first) to avoid partial replacement
        for phrase, col in sorted(self.SYNONYMS.items(), key=lambda x: -len(x[0])):
            pattern = r"\b" + re.escape(phrase) + r"\b"
            replacement = col.replace("_", " ")
            result = re.sub(pattern, replacement, result)
        return result

    def _text_to_binary(self, text: str) -> np.ndarray:
        """Convert user free-text to a binary symptom vector.

        Matching strategy (in priority order):
        1. Exact column name match (e.g. user types "cough" → column "cough")
        2. N-gram match: consecutive words joined with _ match a column
           (e.g. "chest pain" → "chest_pain", "skin rash" → "skin_rash")
        3. Single words ONLY match single-word columns (prevent "pain" from
           matching all 14 pain-related columns)
        """
        vector = np.zeros(len(self.symptom_cols), dtype=np.float64)
        col_set = set(self.symptom_cols)
        col_index = {c: i for i, c in enumerate(self.symptom_cols)}

        # Single-word columns for safe single-word matching
        single_word_cols = {c for c in self.symptom_cols if "_" not in c}

        words = text.lower().replace(",", " ").replace("_", " ").split()
        words = [w.strip() for w in words if w.strip()]

        matched: set[str] = set()

        # Pass 1: Try joining ALL words as one column name
        full = "_".join(words)
        if full in col_set:
            matched.add(full)

        # Pass 2: Try n-grams from longest to shortest (4, 3, 2)
        consumed = set()  # indices of words already matched in n-grams
        for n in (4, 3, 2):
            for i in range(len(words) - n + 1):
                if any(j in consumed for j in range(i, i + n)):
                    continue
                ngram = "_".join(words[i:i + n])
                if ngram in col_set:
                    matched.add(ngram)
                    consumed.update(range(i, i + n))

        # Pass 3: Single-word exact matches (only for single-word columns)
        for i, word in enumerate(words):
            if i in consumed:
                continue
            if word in single_word_cols:
                matched.add(word)

        for col in matched:
            vector[col_index[col]] = 1.0

        return vector

    def predict(self, symptom_text: str) -> dict[str, Any]:
        cleaned = symptom_text.strip().lower()
        if not cleaned:
            raise ValueError("Symptom text is required.")

        expanded = self._expand_synonyms(cleaned)
        features = self._text_to_binary(expanded).reshape(1, -1)
        probas = self.model.predict_proba(features)[0]

        ranked = sorted(
            [
                {
                    "disease": self.labels[i],
                    "confidence": round(float(p), 4),
                }
                for i, p in enumerate(probas)
            ],
            key=lambda x: x["confidence"],
            reverse=True,
        )

        return {
            "prediction": ranked[0]["disease"],
            "confidence": ranked[0]["confidence"],
            "probabilities": ranked,
        }
