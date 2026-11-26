
import math
import torch
import pandas as pd

from pathlib import Path
from torch.utils.data import Dataset, DataLoader
from torch.optim import AdamW
from torch.cuda.amp import autocast, GradScaler
from transformers import (
    AutoTokenizer,
    AutoModelForSequenceClassification,
    get_linear_schedule_with_warmup
)
from sklearn.metrics import accuracy_score, f1_score, classification_report


# ==========================================
# 1. CẤU HÌNH
# ==========================================

BASE_DIR = Path(__file__).resolve().parent

MODEL_NAME = "vinai/phobert-base-v2"
MODEL_DIR = BASE_DIR / "models" / "phobert_sentiment"

TRAIN_PATH = BASE_DIR / "data" / "train_processed.csv"
VAL_PATH = BASE_DIR / "data" / "validation_processed.csv"
TEST_PATH = BASE_DIR / "data" / "test_processed.csv"

LABEL2ID = {
    "NEGATIVE": 0,
    "NEUTRAL": 1,
    "POSITIVE": 2
}

ID2LABEL = {
    0: "NEGATIVE",
    1: "NEUTRAL",
    2: "POSITIVE"
}

MAX_LENGTH = 128
BATCH_SIZE = 2
GRADIENT_ACCUMULATION = 8
EPOCHS = 5
LEARNING_RATE = 2e-5

DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")


# ==========================================
# 2. DATASET
# ==========================================

class SentimentDataset(Dataset):

    def __init__(self, file_path, tokenizer):
        self.df = pd.read_csv(file_path)

        self.texts = self.df["text"].fillna("").astype(str).tolist()
        self.labels = self.df["label"].map(LABEL2ID).tolist()

        if any(label is None or pd.isna(label) for label in self.labels):
            raise ValueError(f"Nhãn không hợp lệ trong file: {file_path}")

        self.encodings = tokenizer(
            self.texts,
            max_length=MAX_LENGTH,
            truncation=True,
            padding="max_length",
            return_tensors="pt"
        )

    def __len__(self):
        return len(self.labels)

    def __getitem__(self, index):
        return {
            "input_ids": self.encodings["input_ids"][index],
            "attention_mask": self.encodings["attention_mask"][index],
            "labels": torch.tensor(
                self.labels[index],
                dtype=torch.long
            )
        }


# ==========================================
# 3. ĐÁNH GIÁ MÔ HÌNH
# ==========================================

def evaluate(model, data_loader):

    model.eval()

    all_predictions = []
    all_labels = []

    with torch.no_grad():

        for batch in data_loader:

            input_ids = batch["input_ids"].to(DEVICE)
            attention_mask = batch["attention_mask"].to(DEVICE)
            labels = batch["labels"].to(DEVICE)

            with autocast(enabled=(DEVICE.type == "cuda")):
                outputs = model(
                    input_ids=input_ids,
                    attention_mask=attention_mask
                )

            predictions = torch.argmax(outputs.logits, dim=1)

            all_predictions.extend(predictions.cpu().tolist())
            all_labels.extend(labels.cpu().tolist())

    accuracy = accuracy_score(all_labels, all_predictions)

    f1 = f1_score(
        all_labels,
        all_predictions,
        average="macro",
        zero_division=0
    )

    return accuracy, f1, all_labels, all_predictions


# ==========================================
# 4. HUẤN LUYỆN
# ==========================================

def train():

    print("Thiết bị huấn luyện:", DEVICE)

    if DEVICE.type == "cuda":
        print("GPU:", torch.cuda.get_device_name(0))

    # Tải tokenizer
    print("\nĐang tải PhoBERT Tokenizer...")

    tokenizer = AutoTokenizer.from_pretrained(
        MODEL_NAME,
        use_fast=False
    )

    # Tải mô hình phân loại
    print("\nĐang tải PhoBERT Classification Model...")

    model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_NAME,
        num_labels=3,
        id2label=ID2LABEL,
        label2id=LABEL2ID
    )

    model.to(DEVICE)

    # Chuẩn bị dữ liệu
    train_dataset = SentimentDataset(TRAIN_PATH, tokenizer)
    val_dataset = SentimentDataset(VAL_PATH, tokenizer)
    test_dataset = SentimentDataset(TEST_PATH, tokenizer)

    train_loader = DataLoader(
        train_dataset,
        batch_size=BATCH_SIZE,
        shuffle=True
    )

    val_loader = DataLoader(
        val_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False
    )

    test_loader = DataLoader(
        test_dataset,
        batch_size=BATCH_SIZE,
        shuffle=False
    )

    # Optimizer
    optimizer = AdamW(
        model.parameters(),
        lr=LEARNING_RATE
    )

    steps_per_epoch = math.ceil(
        len(train_loader) / GRADIENT_ACCUMULATION
    )

    total_steps = steps_per_epoch * EPOCHS

    scheduler = get_linear_schedule_with_warmup(
        optimizer,
        num_warmup_steps=int(total_steps * 0.1),
        num_training_steps=total_steps
    )

    scaler = GradScaler(enabled=(DEVICE.type == "cuda"))

    best_f1 = -1.0

    print("\nBắt đầu huấn luyện PhoBERT...")

    for epoch in range(EPOCHS):

        model.train()
        total_loss = 0.0

        optimizer.zero_grad()

        for step, batch in enumerate(train_loader):

            input_ids = batch["input_ids"].to(DEVICE)
            attention_mask = batch["attention_mask"].to(DEVICE)
            labels = batch["labels"].to(DEVICE)

            with autocast(enabled=(DEVICE.type == "cuda")):

                outputs = model(
                    input_ids=input_ids,
                    attention_mask=attention_mask,
                    labels=labels
                )

                loss = outputs.loss / GRADIENT_ACCUMULATION

            scaler.scale(loss).backward()

            total_loss += loss.item() * GRADIENT_ACCUMULATION

            should_update = (
                (step + 1) % GRADIENT_ACCUMULATION == 0
                or (step + 1) == len(train_loader)
            )

            if should_update:

                scaler.unscale_(optimizer)

                torch.nn.utils.clip_grad_norm_(
                    model.parameters(),
                    max_norm=1.0
                )

                scaler.step(optimizer)
                scaler.update()

                optimizer.zero_grad()
                scheduler.step()

        # Đánh giá validation
        val_accuracy, val_f1, _, _ = evaluate(
            model,
            val_loader
        )

        avg_loss = total_loss / len(train_loader)

        print(f"\nEpoch {epoch + 1}/{EPOCHS}")
        print(f"Training Loss: {avg_loss:.4f}")
        print(f"Validation Accuracy: {val_accuracy:.4f}")
        print(f"Validation Macro F1: {val_f1:.4f}")

        # Lưu mô hình tốt nhất
        if val_f1 > best_f1:

            best_f1 = val_f1

            MODEL_DIR.mkdir(
                parents=True,
                exist_ok=True
            )

            model.save_pretrained(MODEL_DIR)
            tokenizer.save_pretrained(MODEL_DIR)

            print("Đã lưu mô hình tốt nhất!")

    # ======================================
    # 5. ĐÁNH GIÁ TRÊN TEST SET
    # ======================================

    print("\nĐang tải mô hình tốt nhất...")

    del model
    if DEVICE.type == "cuda":
        torch.cuda.empty_cache()

    best_model = AutoModelForSequenceClassification.from_pretrained(
        MODEL_DIR
    ).to(DEVICE)

    accuracy, f1, y_true, y_pred = evaluate(
        best_model,
        test_loader
    )

    print("\n========== KẾT QUẢ TEST ==========")
    print(f"Accuracy: {accuracy:.4f}")
    print(f"Macro F1-score: {f1:.4f}")

    print("\nClassification Report:")

    print(
        classification_report(
            y_true,
            y_pred,
            labels=[0, 1, 2],
            target_names=[
                "NEGATIVE",
                "NEUTRAL",
                "POSITIVE"
            ],
            zero_division=0
        )
    )

    print("Mô hình được lưu tại:", MODEL_DIR)


# ==========================================
# 6. CHẠY CHƯƠNG TRÌNH
# ==========================================

if __name__ == "__main__":
    train()
