
from pathlib import Path

import torch
import torch.nn.functional as F
from transformers import AutoTokenizer, AutoModelForSequenceClassification

from preprocessing import preprocess_text


# ==============================
# 1. CẤU HÌNH
# ==============================

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "models" / "phobert_sentiment"

ID2LABEL = {
    0: "NEGATIVE",
    1: "NEUTRAL",
    2: "POSITIVE"
}

MAX_LENGTH = 128

device = torch.device(
    "cuda" if torch.cuda.is_available() else "cpu"
)


# ==============================
# 2. TẢI TOKENIZER VÀ MODEL
# ==============================

print("Đang tải PhoBERT...")

tokenizer = AutoTokenizer.from_pretrained(
    str(MODEL_DIR),
    use_fast=False
)

model = AutoModelForSequenceClassification.from_pretrained(
    str(MODEL_DIR)
)

model.to(device)
model.eval()

print(f"Đã tải model lên: {device}")


# ==============================
# 3. HÀM DỰ ĐOÁN CẢM XÚC
# ==============================

def predict_sentiment(text: str):

    if not isinstance(text, str) or not text.strip():
        raise ValueError("Nội dung phản hồi không được để trống")

    # Tiền xử lý và tách từ tiếng Việt
    processed_text = preprocess_text(text)

    # Tokenization
    inputs = tokenizer(
        processed_text,
        return_tensors="pt",
        truncation=True,
        padding=True,
        max_length=MAX_LENGTH
    )

    # Chuyển dữ liệu lên GPU hoặc CPU
    inputs = {
        key: value.to(device)
        for key, value in inputs.items()
    }

    # Dự đoán
    with torch.no_grad():
        outputs = model(**inputs)

        probabilities = F.softmax(
            outputs.logits,
            dim=1
        )[0]

    predicted_id = int(torch.argmax(probabilities).item())

    sentiment = ID2LABEL[predicted_id]
    confidence = float(probabilities[predicted_id].item())

    # Xác suất của từng nhãn
    all_probabilities = {
        ID2LABEL[index]: round(float(probabilities[index].item()), 4)
        for index in range(len(ID2LABEL))
    }

    return {
        "text": text,
        "processed_text": processed_text,
        "sentiment": sentiment,
        "confidence": round(confidence, 4),
        "probabilities": all_probabilities
    }


# ==============================
# 4. KIỂM TRA CHỨC NĂNG
# ==============================

if __name__ == "__main__":

    test_sentences = [
        "Món ăn rất ngon, nhân viên phục vụ nhiệt tình.",
        "Đồ ăn nguội lạnh và nhân viên phục vụ rất tệ.",
        "Tôi gọi một phần cơm gà và một chai nước suối."
    ]

    for sentence in test_sentences:

        result = predict_sentiment(sentence)

        print("\n------------------------------")
        print("Nội dung:", result["text"])
        print("Sau tiền xử lý:", result["processed_text"])
        print("Cảm xúc:", result["sentiment"])
        print("Độ tin cậy:", result["confidence"])
        print("Xác suất:", result["probabilities"])
