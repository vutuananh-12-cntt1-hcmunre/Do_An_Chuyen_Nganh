
import pandas as pd

from pathlib import Path
from sklearn.model_selection import train_test_split


# Đường dẫn dataset
BASE_DIR = Path(__file__).resolve().parent
DATA_PATH = BASE_DIR / "data" / "feedback_full.csv"

# Thư mục lưu dữ liệu sau khi chia
OUTPUT_DIR = BASE_DIR / "data"

# Đọc dataset
df = pd.read_csv(DATA_PATH)

# Kiểm tra dữ liệu
print("Tổng số mẫu:", len(df))
print("\nThống kê nhãn:")
print(df["label"].value_counts())

# Kiểm tra dữ liệu thiếu
print("\nDữ liệu thiếu:")
print(df.isnull().sum())

# Kiểm tra dữ liệu trùng lặp
print("\nSố dòng trùng lặp:", df.duplicated(subset=["text"]).sum())

# Chia dữ liệu thành Train (70%) và phần còn lại (30%)
train_df, temp_df = train_test_split(
    df,
    test_size=0.30,
    random_state=42,
    stratify=df["label"]
)

print("\nSố lượng dữ liệu sau lần chia thứ nhất:")
print("Train:", len(train_df))
print("Temp:", len(temp_df))

# Chia Temp thành Validation (15%) và Test (15%)
val_df, test_df = train_test_split(
    temp_df,
    test_size=0.50,
    random_state=42,
    stratify=temp_df["label"]
)

print("\nSố lượng dữ liệu sau khi chia:")
print("Train:", len(train_df))
print("Validation:", len(val_df))
print("Test:", len(test_df))

# Lưu các tập dữ liệu thành file CSV
train_df.to_csv(OUTPUT_DIR / "train.csv", index=False, encoding="utf-8-sig")
val_df.to_csv(OUTPUT_DIR / "validation.csv", index=False, encoding="utf-8-sig")
test_df.to_csv(OUTPUT_DIR / "test.csv", index=False, encoding="utf-8-sig")

print("\nĐã lưu các tập dữ liệu:")
print(" - data/train.csv")
print(" - data/validation.csv")
print(" - data/test.csv")

# Kiểm tra phân bố nhãn trong từng tập dữ liệu
print("\n===== PHÂN BỐ NHÃN =====")

print("\nTrain:")
print(train_df["label"].value_counts())

print("\nValidation:")
print(val_df["label"].value_counts())

print("\nTest:")
print(test_df["label"].value_counts())
