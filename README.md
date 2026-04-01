# MediScan — Disease Detection & Healthcare Navigation System

MediScan is a Flask-based clinical decision-support web application that combines two independent machine-learning models with an interactive hospital map. It is **not a diagnostic tool** — all outputs are for informational purposes only and must be reviewed by a qualified clinician.

---

## Table of Contents

1. [Overview](#overview)
2. [Features](#features)
3. [Project Structure](#project-structure)
4. [Datasets](#datasets)
5. [Model 1 — Symptom Predictor (Random Forest)](#model-1--symptom-predictor-random-forest)
6. [Model 2 — Image Classifier (CNN)](#model-2--image-classifier-cnn)
7. [Prediction Pipelines](#prediction-pipelines)
8. [API Reference](#api-reference)
9. [Installation — macOS](#installation--macos)
10. [Installation — Windows](#installation--windows)
11. [Training the Models](#training-the-models)
12. [Tech Stack](#tech-stack)
13. [Safety Disclaimer](#safety-disclaimer)

---

## Overview

| Capability | Approach | Accuracy |
|---|---|---|
| Symptom → Disease | Random Forest (132 binary features, 41 classes) | ~93% test / ~92.87% CV |
| Skin Image → Lesion Type | Custom CNN (6 Conv2D layers, 323 K params) | ~72.97% test |
| Nearby Hospitals | Leaflet.js + Overpass API (OpenStreetMap) | Real-time |

---

## Features

- Free-text symptom entry with synonym expansion and n-gram matching
- Medical image upload (JPG / PNG) for skin lesion classification
- Top-N ranked disease probabilities returned for both models
- Interactive map: auto-locates user and pins nearby hospitals
- HTML5 form validation with loading spinners and error messages
- Persistent safety disclaimer in footer and all prediction responses
- JSON REST API for all model inference endpoints
- Single-page application (no page reloads)

---

## Project Structure

```
MediScan/
│
├── app.py                         # Flask application entry point
│
├── app/
│   ├── ml/
│   │   ├── symptom_model.py       # SymptomPredictor class (RF inference)
│   │   └── image_model.py         # ImagePredictor class (CNN inference)
│   ├── static/
│   │   ├── css/styles.css         # Light blue/white UI theme
│   │   └── js/app.js              # SPA logic, form handling, map
│   └── templates/
│       └── index.html             # Single-page HTML template
│
├── scripts/
│   ├── download_datasets.py       # Kaggle dataset downloader
│   ├── train_symptom_model.py     # RF training script
│   ├── train_image_model.py       # CNN training script
│   └── bootstrap_models.py        # Quick bootstrap (no Kaggle needed)
│
├── models/
│   ├── symptom_rf_pipeline.joblib # Trained RF + vocabulary artifacts
│   ├── image_cnn_model.keras      # Trained CNN weights
│   └── image_class_names.json     # Ordered class label list
│
├── data/
│   ├── processed/symptoms.csv     # Cleaned symptom training data
│   ├── test_images/               # 7 sample images (one per lesion class)
│   └── raw/                       # Downloaded Kaggle datasets (gitignored)
│
├── requirements.txt
├── .env.example
└── .gitignore
```

---

## Datasets

### Symptom Dataset
- **Source:** Kaggle — [`kaushil268/disease-prediction-using-machine-learning`](https://www.kaggle.com/datasets/kaushil268/disease-prediction-using-machine-learning)
- **Rows:** 4,920 patient records
- **Features:** 132 binary symptom columns (0 = absent, 1 = present)
- **Target:** 41 disease labels (`prognosis` column)
- **Format:** CSV with one row per patient, each column a symptom flag

### Skin Lesion Dataset
- **Source:** MedMNIST — DermaMNIST (subset of ISIC archive)
- **Train:** 7,007 images &nbsp;|&nbsp; **Test:** 2,005 images
- **Input size:** 28 × 28 RGB (upscaled to 128 × 128 during preprocessing)
- **Classes:** 7 skin lesion types (see Model 2 section)

---

## Model 1 — Symptom Predictor (Random Forest)

### Overview

A **scikit-learn Random Forest** classifier trained on 132 binary symptom features to predict one of 41 diseases. The model is wrapped in a custom inference pipeline that converts user free-text into the binary feature vector the model expects.

### Training Parameters

| Parameter | Value |
|---|---|
| Algorithm | `RandomForestClassifier` |
| n_estimators | **200** trees |
| max_depth | **12** |
| Criterion | Gini impurity |
| Noise injection (flip rate) | **10.5%** random bit flips for realism |
| Train / Test split | 80 / 20 stratified |
| Cross-validation | 5-fold Stratified K-Fold |
| Random state | 42 |

### Performance

| Metric | Score |
|---|---|
| Training accuracy | ~99% (intentionally noisy data) |
| Test accuracy | **~93.09%** |
| 5-Fold CV mean | **~92.87%** (± ~0.8%) |

> Noise injection (`flip_rate=0.105`) randomly flips ~10.5% of binary symptom values before training. This prevents overfitting to perfectly clean data and produces realistic generalisation estimates.

### Feature Engineering

- **Input:** 132 binary columns, one per symptom (e.g. `cough`, `high_fever`, `skin_rash`, `chest_pain`, etc.)
- **TF-IDF vectorizer** is fitted on symptom column names (converted to readable phrases) with `ngram_range=(1, 2)`, `max_features=4000`. It is stored in the artifact for potential keyword-weighting extensions.
- **Final classifier input:** 132-dimensional binary vector from the matched symptoms.

### 41 Supported Disease Classes

```
(vertigo) Paroxysmal Positional Vertigo,  AIDS,  Acne,  Alcoholic Hepatitis,
Allergy,  Arthritis,  Bronchial Asthma,  Cervical Spondylosis,  Chicken Pox,
Chronic Cholestasis,  Common Cold,  Dengue,  Diabetes,
Dimorphic Hemorrhoids (Piles),  Drug Reaction,  Fungal Infection,  GERD,
Gastroenteritis,  Heart Attack,  Hepatitis A/B/C/D/E,  Hypertension,
Hyperthyroidism,  Hypoglycemia,  Hypothyroidism,  Impetigo,  Jaundice,
Malaria,  Migraine,  Osteoarthritis,  Paralysis (Brain Hemorrhage),
Peptic Ulcer Disease,  Pneumonia,  Psoriasis,  Tuberculosis,  Typhoid,
Urinary Tract Infection,  Varicose Veins
```

### Saved Artifact

`models/symptom_rf_pipeline.joblib` — a Python dictionary containing:

| Key | Type | Description |
|---|---|---|
| `model` | `RandomForestClassifier` | Trained classifier |
| `labels` | `list[str]` | Class names in the same order as `predict_proba` columns |
| `symptom_cols` | `list[str]` | 132 column names (same order as training features) |
| `vocab` | `dict[str, list[str]]` | Keyword → list of matching symptom columns |
| `tfidf` | `TfidfVectorizer` | Fitted vectorizer for column text |

---

## Model 2 — Image Classifier (CNN)

### Overview

A custom **Convolutional Neural Network** built with TensorFlow / Keras, trained to classify dermoscopy images into 7 skin lesion categories. The architecture uses paired Conv2D blocks with Batch Normalization, MaxPooling, and Dropout for regularisation.

### Architecture — Layer-by-Layer

```
Input: (128, 128, 3)   ← RGB image, normalised to [0, 1]
│
├── [Data Augmentation — training only]
│   ├── RandomFlip("horizontal")
│   ├── RandomRotation(±15%)
│   ├── RandomZoom(±10%)
│   └── RandomContrast(±10%)
│
├── ── BLOCK 1 ──────────────────────────────────────
│   ├── Conv2D(32, 3×3, padding=same, ReLU)   →  (128,128,32)   params: 896
│   ├── BatchNormalization                     →  (128,128,32)   params: 128
│   ├── Conv2D(32, 3×3, padding=same, ReLU)   →  (128,128,32)   params: 9,248
│   ├── MaxPooling2D(2×2)                      →  (64,64,32)
│   └── Dropout(0.25)
│
├── ── BLOCK 2 ──────────────────────────────────────
│   ├── Conv2D(64, 3×3, padding=same, ReLU)   →  (64,64,64)     params: 18,496
│   ├── BatchNormalization                     →  (64,64,64)     params: 256
│   ├── Conv2D(64, 3×3, padding=same, ReLU)   →  (64,64,64)     params: 36,928
│   ├── MaxPooling2D(2×2)                      →  (32,32,64)
│   └── Dropout(0.25)
│
├── ── BLOCK 3 ──────────────────────────────────────
│   ├── Conv2D(128, 3×3, padding=same, ReLU)  →  (32,32,128)    params: 73,856
│   ├── BatchNormalization                     →  (32,32,128)    params: 512
│   ├── Conv2D(128, 3×3, padding=same, ReLU)  →  (32,32,128)    params: 147,584
│   ├── MaxPooling2D(2×2)                      →  (16,16,128)
│   └── Dropout(0.25)
│
├── GlobalAveragePooling2D                     →  (128,)
│
├── ── CLASSIFIER HEAD ──────────────────────────────
│   ├── Dense(256, ReLU)                       →  (256,)         params: 33,024
│   ├── BatchNormalization                                        params: 1,024
│   ├── Dropout(0.5)
│   └── Dense(7, Softmax)                      →  (7,)           params: 1,799
│
Output: 7 class probabilities (sum = 1.0)
```

**Total parameters: 323,751 (1.24 MB)**
- Trainable: 322,791
- Non-trainable (BN running stats): 960

### Training Configuration

| Parameter | Value |
|---|---|
| Optimizer | Adam (`lr=1e-3`) |
| Loss | Sparse Categorical Cross-entropy |
| Epochs | 30 (with early stopping) |
| Batch size | 64 |
| Input image size | 128 × 128 × 3 (RGB, normalised) |
| EarlyStopping | `monitor=val_accuracy`, `patience=8`, `restore_best_weights=True` |
| ReduceLROnPlateau | `monitor=val_accuracy`, `factor=0.5`, `patience=3`, `min_lr=1e-6` |

### Performance

| Metric | Value |
|---|---|
| Best epoch | 25 / 30 |
| Best validation accuracy | **72.97%** |
| Final test accuracy | **72.97%** (best weights restored) |

### 7 Skin Lesion Classes

| Index | Class | Clinical Description |
|---|---|---|
| 0 | Actinic keratoses | Pre-cancerous rough scaly patches from sun damage |
| 1 | Basal cell carcinoma | Most common skin cancer; slow-growing |
| 2 | Benign keratosis | Non-cancerous scaly growths (seborrheic keratosis) |
| 3 | Dermatofibroma | Benign fibrous nodule, usually on legs |
| 4 | Melanoma | Aggressive malignant skin cancer |
| 5 | Melanocytic nevi | Common benign moles (most frequent class) |
| 6 | Vascular lesions | Blood vessel-related skin lesions |

### Design Choices

- **`padding="same"`** on all Conv2D layers preserves spatial dimensions through convolution
- **Paired Conv2D blocks** (two convolutions before pooling) allow the network to learn more complex features at each scale before downsampling
- **BatchNormalization** after the first Conv2D in each block stabilises training and accelerates convergence
- **GlobalAveragePooling2D** (instead of Flatten) reduces the parameter count, reduces overfitting, and provides spatial invariance
- **Data augmentation layers** are embedded in the model itself (not a separate pipeline), so they apply live during `model.fit()` and are automatically disabled during `model.predict()`

---

## Prediction Pipelines

### Symptom Pipeline

```
User text input
      │
      ▼
Synonym expansion
  (e.g. "fever" → "high_fever", "throwing up" → "vomiting")
      │
      ▼
N-gram matching (priority: 4-gram → 3-gram → 2-gram → 1-gram)
  (e.g. "chest pain" → column "chest_pain")
      │
      ▼
Binary vector (132-dim, 0 or 1 per symptom)
      │
      ▼
RandomForestClassifier.predict_proba()
      │
      ▼
Top-N ranked diseases with confidence scores
```

**Synonym expansion rules** — 70+ medical phrases are mapped to dataset column names (e.g. `"short of breath"` → `breathlessness`, `"body ache"` → `muscle_pain`). Replacement uses `re.sub` with `\b` word boundaries to avoid partial-word collisions.

**N-gram matching safety rule** — single words are only permitted to match single-word columns. This prevents ambiguous words like `"pain"` from matching all 14 pain-related columns simultaneously.

### Image Pipeline

```
Uploaded file (JPG / PNG)
      │
      ▼
PIL.Image.open() → convert("RGB")
      │
      ▼
Resize to 128 × 128 pixels (BILINEAR interpolation)
      │
      ▼
Normalise pixel values: [0, 255] → [0.0, 1.0]
      │
      ▼
np.expand_dims(axis=0)  →  shape (1, 128, 128, 3)
      │
      ▼
model.predict()  →  softmax probabilities shape (1, 7)
      │
      ▼
Top-N ranked lesion classes with confidence scores
```

---

## API Reference

All endpoints return JSON.

### `GET /api/health`
Returns service status.

```json
{ "ok": true, "service": "MediScan", "status": "ready" }
```

### `POST /api/predict/symptoms`
**Content-Type:** `application/json`

**Request:**
```json
{ "symptoms": "fever, cough, sore throat, fatigue" }
```

**Response:**
```json
{
  "ok": true,
  "source": "symptoms",
  "result": {
    "prediction": "Common Cold",
    "confidence": 0.86,
    "probabilities": [
      { "disease": "Common Cold", "confidence": 0.86 },
      { "disease": "Bronchial Asthma", "confidence": 0.04 }
    ]
  },
  "guidance": {
    "general": "This result is decision-support only and not a diagnosis.",
    "next_step": "Please consult a qualified doctor for accurate clinical advice."
  }
}
```

### `POST /api/predict/image`
**Content-Type:** `multipart/form-data`

**Request:** form field `image` = skin lesion image file (JPG or PNG)

**Response:** same structure as symptoms, `"source": "image"`, disease is one of the 7 lesion classes.

---

## Installation — macOS

### Prerequisites

- macOS 12 Monterey or later
- Python 3.11 (install via [Homebrew](https://brew.sh/): `brew install python@3.11`)
- Git (`brew install git`)

### Steps

```bash
# 1. Clone the repository
git clone https://github.com/your-username/MediScan.git
cd MediScan

# 2. Create a virtual environment using Python 3.11
python3.11 -m venv .venv

# 3. Activate the virtual environment
source .venv/bin/activate

# 4. Upgrade pip and install dependencies
pip install --upgrade pip
pip install -r requirements.txt

# 5. (Optional) Download real Kaggle datasets for retraining
#    Place your kaggle.json at ~/.kaggle/kaggle.json  OR  set env vars:
export KAGGLE_USERNAME=your_kaggle_username
export KAGGLE_KEY=your_kaggle_api_key
python scripts/download_datasets.py

# 6. (Optional) Retrain models from scratch
python scripts/train_symptom_model.py
python scripts/train_image_model.py

# 7. Run the Flask application
PORT=5003 python app.py
```

Open your browser at **http://127.0.0.1:5003**

> Pre-trained model artifacts (`models/`) are already included in the repository. Steps 5–6 are only needed if you want to retrain.

---

## Installation — Windows

### Prerequisites

- Windows 10 / 11 (64-bit)
- Python 3.11 — download from [python.org](https://www.python.org/downloads/) and check **"Add Python to PATH"** during installation
- Git — download from [git-scm.com](https://git-scm.com/download/win)

### Steps (Command Prompt)

```cmd
REM 1. Clone the repository
git clone https://github.com/your-username/MediScan.git
cd MediScan

REM 2. Create a virtual environment
python -m venv .venv

REM 3. Activate the virtual environment
.venv\Scripts\activate.bat

REM 4. Upgrade pip and install dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

REM 5. (Optional) Set Kaggle credentials and download datasets
set KAGGLE_USERNAME=your_kaggle_username
set KAGGLE_KEY=your_kaggle_api_key
python scripts/download_datasets.py

REM 6. (Optional) Retrain models
python scripts/train_symptom_model.py
python scripts/train_image_model.py

REM 7. Run the Flask application
set PORT=5003
python app.py
```

### Steps (PowerShell)

```powershell
# 1. Clone the repository
git clone https://github.com/your-username/MediScan.git
cd MediScan

# 2. Create and activate virtual environment
python -m venv .venv
.venv\Scripts\Activate.ps1

# If PowerShell execution policy blocks the activation script:
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser

# 3. Install dependencies
python -m pip install --upgrade pip
pip install -r requirements.txt

# 4. (Optional) Kaggle datasets
$env:KAGGLE_USERNAME = "your_kaggle_username"
$env:KAGGLE_KEY      = "your_kaggle_api_key"
python scripts/download_datasets.py

# 5. Run
$env:PORT = "5003"
python app.py
```

Open your browser at **http://127.0.0.1:5003**

> **Windows note:** TensorFlow 2.18+ supports Windows natively without WSL. If you encounter a TensorFlow install error, try `pip install tensorflow-cpu` for CPU-only inference.

---

## Training the Models

### Retrain Symptom Model

```bash
python scripts/train_symptom_model.py
```

Outputs to console:
- Disease count, symptom feature count, sample sizes
- Train accuracy, test accuracy, 5-Fold CV mean ± std
- Per-class classification report
- Saves: `models/symptom_rf_pipeline.joblib`

### Retrain Image Model

```bash
python scripts/train_image_model.py
```

Outputs to console:
- Live epoch-by-epoch accuracy and loss (Keras progress bars)
- ReduceLROnPlateau and EarlyStopping events
- Final test accuracy on DermaMNIST test split
- Saves: `models/image_cnn_model.keras`, `models/image_class_names.json`

Training time: ~40–90 minutes on CPU (Apple Silicon M-series: ~35 min, Intel: ~90 min).

### Bootstrap (No Kaggle Required)

```bash
python scripts/bootstrap_models.py
```

Creates lightweight placeholder models using synthetic data — useful for UI development without downloading large datasets.

---

## Tech Stack

| Layer | Library / Tool | Version |
|---|---|---|
| Web framework | Flask | 3.1.0 |
| ML — tabular | scikit-learn | 1.6.1 |
| ML — deep learning | TensorFlow / Keras | 2.18.0 |
| Numerical computing | NumPy | 2.0.2 |
| Data processing | Pandas | 2.2.3 |
| Image processing | Pillow | 11.0.0 |
| Model serialisation | Joblib | 1.4.2 |
| Dataset download | Kaggle API | 1.6.17 |
| Map tiles | OpenStreetMap + Leaflet.js | 1.9.4 |
| Hospital data | Overpass API (OSM) | — |
| Fonts | IBM Plex Sans + Space Grotesk | Google Fonts |
| Python runtime | CPython | 3.11 |

---

## Safety Disclaimer

> **MediScan is a decision-support tool, not a medical device.**
>
> All predictions — whether from the symptom model or the image classifier — are probabilistic estimates based on limited training data. They do not constitute a medical diagnosis. Always consult a qualified and licensed healthcare professional for clinical evaluation and treatment decisions.
>
> MediScan does not store any personal health data. No information entered into the application is transmitted beyond your local machine.

