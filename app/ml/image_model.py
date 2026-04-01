from __future__ import annotations

import json
from pathlib import Path
from typing import Any

import keras
import numpy as np
from PIL import Image


class ImagePredictor:
    """Loads and serves the CNN model for image-based disease classification."""

    def __init__(self, model_path: str | Path, labels_path: str | Path) -> None:
        self.model_path = Path(model_path)
        self.labels_path = Path(labels_path)
        self.model = None
        self.labels: list[str] = []
        self.image_size = (128, 128)
        self._load()

    def _load(self) -> None:
        if not self.model_path.exists() or not self.labels_path.exists():
            raise FileNotFoundError(
                f"Image model artifacts are missing at {self.model_path} and {self.labels_path}."
            )

        self.model = keras.models.load_model(self.model_path)
        self.labels = json.loads(self.labels_path.read_text())

    def preprocess(self, image_file: Any) -> np.ndarray:
        image = Image.open(image_file).convert("RGB")
        image = image.resize(self.image_size)
        arr = np.asarray(image, dtype=np.float32) / 255.0
        return np.expand_dims(arr, axis=0)

    def predict(self, image_file: Any) -> dict[str, Any]:
        x = self.preprocess(image_file)
        probas = self.model.predict(x, verbose=0)[0]
        winner_idx = int(np.argmax(probas))

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
