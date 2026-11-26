
import torch
from transformers import AutoTokenizer, AutoModelForMaskedLM

MODEL_NAME = "vinai/phobert-base-v2"

print("Đang tải tokenizer...")
tokenizer = AutoTokenizer.from_pretrained(
    MODEL_NAME,
    use_fast=False
)

print("Đang tải mô hình PhoBERT...")
model = AutoModelForMaskedLM.from_pretrained(MODEL_NAME)

device = torch.device("cuda" if torch.cuda.is_available() else "cpu")
model.to(device)
model.eval()

print("Thiết bị:", device)

# Câu thử nghiệm đã được tách từ
sentence = "Món_ăn này rất <mask> ."

inputs = tokenizer(sentence, return_tensors="pt")
inputs = {key: value.to(device) for key, value in inputs.items()}

mask_position = (inputs["input_ids"] == tokenizer.mask_token_id).nonzero(
    as_tuple=True
)[1]

with torch.no_grad():
    outputs = model(**inputs)

logits = outputs.logits[0, mask_position.item()]
top_tokens = torch.topk(logits, k=5)

print("\nCâu thử nghiệm:", sentence)
print("5 từ dự đoán:")

for token_id in top_tokens.indices:
    print(tokenizer.decode([token_id.item()]))

print("\nPhoBERT hoạt động thành công!")
