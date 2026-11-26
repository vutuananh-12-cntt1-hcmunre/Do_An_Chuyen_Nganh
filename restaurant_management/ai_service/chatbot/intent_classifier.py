
import re
INTENTS = {
    "FILTER_DISH": [
        "món nào dưới",
        "món nào trên",
        "dưới",
        "trên",
        "khoảng giá",
        "bao nhiêu tiền",
        "giá bao nhiêu",
        "món rẻ",
        "món đắt",
        "theo giá",
        "trong khoảng",
        "không quá",
        "thấp hơn",
        "cao hơn",
        "lớn hơn",
        "nhỏ hơn",
        "từ",
        "đến",
    ],

    "POPULAR_DISH": [
        "được khách gọi nhiều nhất",
        "khách gọi nhiều",
        "nhiều người gọi",
        "gọi nhiều nhất",
        "bán chạy",
        "phổ biến",
        "được yêu thích",
        "món nổi bật",
        "món ngon nhất",
    ],

    "FIND_PROMOTION": [
        "khuyến mãi",
        "khuyến mại",
        "giảm giá",
        "ưu đãi",
        "voucher",
        "mã giảm giá",
    ],

    "RESERVE_TABLE": [
        "đặt bàn",
        "đặt chỗ",
        "đặt trước",
        "còn bàn",
        "chỗ ngồi",
        "số người",
    ],

    "FIND_DISH": [
        "có món",
        "tìm món",
        "món ăn",
        "thực đơn",
        "menu",
        "nhà hàng có",
        "bán món",
    ],

    "GREETING": [
        "xin chào",
        "chào bạn",
        "hello",
        "hi",
    ],
}


def normalize_text(text: str) -> str:
    """
    Chuẩn hóa câu hỏi:
    - Chuyển thành chữ thường.
    - Loại bỏ khoảng trắng thừa.
    """

    text = text.lower().strip()
    text = re.sub(r"\s+", " ", text)

    return text


def classify_intent(text: str) -> dict:
    """
    Phân loại ý định câu hỏi của khách hàng.

    Các Intent:
    - FILTER_DISH
    - POPULAR_DISH
    - FIND_PROMOTION
    - RESERVE_TABLE
    - FIND_DISH
    - GREETING
    - UNKNOWN
    """

    if not text or not text.strip():
        return {
            "intent": "UNKNOWN",
            "confidence": 0.0
        }

    normalized_text = normalize_text(text)

    # 1. Kiểm tra điều kiện lọc giá
    price_keywords = [
        "dưới",
        "trên",
        "nhỏ hơn",
        "lớn hơn",
        "thấp hơn",
        "cao hơn",
        "ít hơn",
        "nhiều hơn",
        "tối đa",
        "tối thiểu",
        "không quá",
        "khoảng giá",
        "trong khoảng",
        "bao nhiêu tiền",
        "giá bao nhiêu",
        "món rẻ",
        "món đắt",
        "theo giá",
    ]

    has_price_keyword = any(
        keyword in normalized_text
        for keyword in price_keywords
    )

    # Kiểm tra câu hỏi có chứa số hay không
    has_number = bool(
        re.search(r"\d+", normalized_text)
    )

    # Kiểm tra cấu trúc khoảng giá: từ X đến Y
    has_price_range = bool(
        re.search(
            r"từ\s*\d+(?:[.,]\d+)?\s*"
            r"(?:triệu|tr|nghìn|ngàn|ng|k|đồng|đ)?\s*"
            r"đến\s*\d+(?:[.,]\d+)?",
            normalized_text
        )
    )

    # Ưu tiên FILTER_DISH nếu có điều kiện giá
    if (
        (has_price_keyword and has_number)
        or has_price_range
    ):
        return {
            "intent": "FILTER_DISH",
            "confidence": 1.0
        }

    # 2. Đếm số từ khóa khớp của từng Intent
    scores = {}

    for intent, keywords in INTENTS.items():
        score = sum(
            1 for keyword in keywords
            if keyword in normalized_text
        )

        scores[intent] = score

    # 3. Chọn Intent có điểm cao nhất
    best_intent = max(
        scores,
        key=scores.get
    )

    best_score = scores[best_intent]

    # Không tìm thấy từ khóa phù hợp
    if best_score == 0:
        return {
            "intent": "UNKNOWN",
            "confidence": 0.0
        }

    # 4. Tính độ tin cậy tương đối
    confidence = min(
        best_score / 2,
        1.0
    )

    return {
        "intent": best_intent,
        "confidence": round(confidence, 4)
    }
