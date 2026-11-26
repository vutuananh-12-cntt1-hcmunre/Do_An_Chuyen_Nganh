
from pathlib import Path
import py_vncorenlp

# Lấy đường dẫn tuyệt đối đến thư mục mô hình
BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "vncorenlp"

print("Đang khởi tạo VnCoreNLP...")

segmenter = py_vncorenlp.VnCoreNLP(
    annotators=["wseg"],
    save_dir=str(MODEL_DIR)
)

sentences = [
    "Món ăn này rất ngon.",
    "Nhà hàng có không gian đẹp và nhân viên nhiệt tình.",
    "Tôi rất hài lòng với chất lượng phục vụ.",
    "Giá cả hợp lý nhưng món ăn hơi nguội."
]

for sentence in sentences:
    print("\nCâu gốc:", sentence)
    print("Tách từ:", segmenter.word_segment(sentence))

result = segmenter.word_segment(sentence)

print("\nCâu ban đầu:")
print(sentence)

print("\nCâu sau khi tách từ:")
print(result)

print("\nVnCoreNLP hoạt động thành công!")
