from __future__ import annotations

import json
import os
from pathlib import Path

from kaggle.api.kaggle_api_extended import KaggleApi

BASE_DIR = Path(__file__).resolve().parents[1]
RAW_DIR = BASE_DIR / "data" / "raw"
KAGGLE_DIR = Path.home() / ".kaggle"

# Public datasets used for symptom and image tasks.
DATASETS = [
    "kaushil268/disease-prediction-using-machine-learning",
    "kmader/skin-cancer-mnist-ham10000",
]


def configure_kaggle_credentials() -> None:
    username = os.getenv("KAGGLE_USERNAME", "kondusrivardhan")
    key = os.getenv("KAGGLE_KEY", "ae52d75731b8d291954312c8b3151ebb")

    KAGGLE_DIR.mkdir(parents=True, exist_ok=True)
    kaggle_json = KAGGLE_DIR / "kaggle.json"
    kaggle_json.write_text(json.dumps({"username": username, "key": key}))
    os.chmod(kaggle_json, 0o600)


def download_all() -> None:
    RAW_DIR.mkdir(parents=True, exist_ok=True)
    configure_kaggle_credentials()

    api = KaggleApi()
    api.authenticate()

    for dataset in DATASETS:
        print(f"Downloading {dataset}...")
        api.dataset_download_files(dataset, path=RAW_DIR / dataset.split("/")[-1], unzip=True)


if __name__ == "__main__":
    download_all()
    print("Download complete.")
