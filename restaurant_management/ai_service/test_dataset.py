import pandas as pd

DATA_PATH = "data/feedback.csv"

df = pd.read_csv(DATA_PATH)

print("5 dòng dữ liệu đầu tiên:")
print(df.head())

print("\nSố lượng dữ liệu:")
print(len(df))

print("\nThống kê nhãn:")
print(df["label"].value_counts())

print("\nKiểm tra dữ liệu thiếu:")
print(df.isnull().sum())
