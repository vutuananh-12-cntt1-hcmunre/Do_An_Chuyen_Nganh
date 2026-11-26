
import py_vncorenlp
from pathlib import Path


# Xác định đường dẫn VnCoreNLP
BASE_DIR = Path(__file__).resolve().parent
VNCORenLP_DIR = BASE_DIR / "vncorenlp"

# Khởi tạo bộ tách từ
segmenter = py_vncorenlp.VnCoreNLP(
    save_dir=str(VNCORenLP_DIR),
    annotators=["wseg"]
)


def preprocess_text(text: str) -> str:
    """
    Tiền xử lý và tách từ văn bản tiếng Việt.
    """

    if not isinstance(text, str) or not text.strip():
        return ""

    # Chuẩn hóa khoảng trắng
    text = " ".join(text.strip().split())

    # Tách từ tiếng Việt
    segmented_sentences = segmenter.word_segment(text)

    # Ghép kết quả thành một chuỗi
    return " ".join(segmented_sentences)



import pandas as pd


def preprocess_dataset(input_file: str, output_file: str):
    """
    Đọc CSV, tiền xử lý cột text và lưu kết quả.
    """

    input_path = BASE_DIR / "data" / input_file
    output_path = BASE_DIR / "data" / output_file

    df = pd.read_csv(input_path)

    # Tiền xử lý từng câu trong cột text
    df["text"] = df["text"].apply(preprocess_text)

    # Lưu dữ liệu
    df.to_csv(output_path, index=False, encoding="utf-8-sig")

    print(f"\nĐã tiền xử lý: {input_file}")
    print("Số mẫu:", len(df))
    print("Đã lưu:", output_file)

    print("\nVí dụ:")
    print(df.head(3))


if __name__ == "__main__":

    preprocess_dataset("train.csv", "train_processed.csv")
    preprocess_dataset("validation.csv", "validation_processed.csv")
    preprocess_dataset("test.csv", "test_processed.csv")
