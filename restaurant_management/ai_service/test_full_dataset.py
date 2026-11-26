
import pandas as pd

from pathlib import Path

DATA_PATH = Path(__file__).resolve().parent / "data" / "feedback_full.csv"

print("Đang đọc file:", DATA_PATH)

df = pd.read_csv(DATA_PATH)

print("5 dòng đầu tiên:")
print(df.head())

print("\nTổng số dữ liệu:")
print(len(df))

print("\nThống kê nhãn:")
print(df["label"].value_counts())

print("\nDữ liệu thiếu:")
print(df.isnull().sum())

print("\nDữ liệu trùng lặp:")
print(df.duplicated(subset=["text"]).sum())
print("\nCác dòng bị trùng:")
duplicates = df[df.duplicated(subset=["text"], keep=False)]

print(duplicates)
