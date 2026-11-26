
from pathlib import Path
from urllib.request import urlretrieve

BASE_DIR = Path(__file__).resolve().parent
MODEL_DIR = BASE_DIR / "vncorenlp"
WORDSEG_DIR = MODEL_DIR / "models" / "wordsegmenter"

WORDSEG_DIR.mkdir(parents=True, exist_ok=True)

FILES = {
    "VnCoreNLP-1.2.jar":
        "https://raw.githubusercontent.com/vncorenlp/VnCoreNLP/master/VnCoreNLP-1.2.jar",

    "models/wordsegmenter/vi-vocab":
        "https://raw.githubusercontent.com/vncorenlp/VnCoreNLP/master/models/wordsegmenter/vi-vocab",

    "models/wordsegmenter/wordsegmenter.rdr":
        "https://raw.githubusercontent.com/vncorenlp/VnCoreNLP/master/models/wordsegmenter/wordsegmenter.rdr",
}

for relative_path, url in FILES.items():
    destination = MODEL_DIR / relative_path

    if destination.exists() and destination.stat().st_size > 0:
        print(f"Đã tồn tại: {relative_path}")
        continue

    print(f"Đang tải: {relative_path}")

    urlretrieve(url, destination)

    print(f"Tải thành công: {relative_path}")

print("\nĐã tải đầy đủ dữ liệu RDRSegmenter!")
