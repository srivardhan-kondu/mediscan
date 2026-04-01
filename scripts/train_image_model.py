from __future__ import annotations

import json
from pathlib import Path

import keras
import numpy as np
from keras import layers
from PIL import Image

BASE_DIR = Path(__file__).resolve().parents[1]
MODELS_DIR = BASE_DIR / "models"

# DermaMNIST label mapping (7 skin lesion classes)
CLASSES = [
    "Actinic keratoses",
    "Basal cell carcinoma",
    "Benign keratosis",
    "Dermatofibroma",
    "Melanoma",
    "Melanocytic nevi",
    "Vascular lesions",
]


def load_dermamnist() -> tuple[np.ndarray, np.ndarray, np.ndarray, np.ndarray]:
    """Download and load DermaMNIST via medmnist (28x28 RGB skin lesion images)."""
    import medmnist
    from medmnist import DermaMNIST

    train_ds = DermaMNIST(split="train", download=True, root=str(BASE_DIR / "data" / "raw"))
    test_ds = DermaMNIST(split="test", download=True, root=str(BASE_DIR / "data" / "raw"))

    X_train = np.stack([np.array(img) for img, _ in train_ds]).astype(np.float32)
    y_train = np.array([int(label) for _, label in train_ds])

    X_test = np.stack([np.array(img) for img, _ in test_ds]).astype(np.float32)
    y_test = np.array([int(label) for _, label in test_ds])

    return X_train, y_train, X_test, y_test


def preprocess(images: np.ndarray, target_size: int = 128) -> np.ndarray:
    """Resize 28x28 images to target_size x target_size and normalize to [0, 1]."""
    resized = np.zeros((len(images), target_size, target_size, 3), dtype=np.float32)
    for i, img_arr in enumerate(images):
        img = Image.fromarray(img_arr.astype(np.uint8))
        img = img.resize((target_size, target_size), Image.BILINEAR)
        resized[i] = np.array(img, dtype=np.float32) / 255.0
    return resized


def build_model(num_classes: int) -> keras.Model:
    model = keras.Sequential(
        [
            layers.Input(shape=(128, 128, 3)),
            # Data augmentation layers (only active during training)
            layers.RandomFlip("horizontal"),
            layers.RandomRotation(0.15),
            layers.RandomZoom(0.1),
            layers.RandomContrast(0.1),
            # Feature extraction
            layers.Conv2D(32, 3, padding="same", activation="relu"),
            layers.BatchNormalization(),
            layers.Conv2D(32, 3, padding="same", activation="relu"),
            layers.MaxPooling2D(),
            layers.Dropout(0.25),
            layers.Conv2D(64, 3, padding="same", activation="relu"),
            layers.BatchNormalization(),
            layers.Conv2D(64, 3, padding="same", activation="relu"),
            layers.MaxPooling2D(),
            layers.Dropout(0.25),
            layers.Conv2D(128, 3, padding="same", activation="relu"),
            layers.BatchNormalization(),
            layers.Conv2D(128, 3, padding="same", activation="relu"),
            layers.MaxPooling2D(),
            layers.Dropout(0.25),
            # Classification head
            layers.GlobalAveragePooling2D(),
            layers.Dense(256, activation="relu"),
            layers.BatchNormalization(),
            layers.Dropout(0.5),
            layers.Dense(num_classes, activation="softmax"),
        ]
    )
    model.compile(
        optimizer=keras.optimizers.Adam(learning_rate=1e-3),
        loss="sparse_categorical_crossentropy",
        metrics=["accuracy"],
    )
    return model


def train() -> None:
    MODELS_DIR.mkdir(parents=True, exist_ok=True)

    print("Loading DermaMNIST dataset...")
    X_train, y_train, X_test, y_test = load_dermamnist()
    print(f"  Train: {X_train.shape[0]} images, Test: {X_test.shape[0]} images, Classes: {len(CLASSES)}")

    print("Preprocessing images (resize 28→128, normalize)...")
    X_train = preprocess(X_train)
    X_test = preprocess(X_test)

    model = build_model(len(CLASSES))

    # Learning rate scheduler: reduce on plateau
    lr_cb = keras.callbacks.ReduceLROnPlateau(
        monitor="val_accuracy", factor=0.5, patience=3, min_lr=1e-6, verbose=1
    )
    early_cb = keras.callbacks.EarlyStopping(
        monitor="val_accuracy", patience=8, restore_best_weights=True, verbose=1
    )

    model.fit(
        X_train, y_train,
        validation_data=(X_test, y_test),
        epochs=30,
        batch_size=64,
        callbacks=[lr_cb, early_cb],
        verbose=1,
    )

    loss, acc = model.evaluate(X_test, y_test, verbose=0)
    print(f"Test accuracy: {acc:.4f}")

    model.save(MODELS_DIR / "image_cnn_model.keras")
    (MODELS_DIR / "image_class_names.json").write_text(json.dumps(CLASSES))
    print("Saved image model artifacts.")


if __name__ == "__main__":
    train()
