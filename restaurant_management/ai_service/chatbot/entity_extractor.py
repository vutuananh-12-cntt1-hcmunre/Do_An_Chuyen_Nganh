
import re
from datetime import datetime, date, timedelta
from zoneinfo import ZoneInfo


def normalize_price(amount: str, unit: str = "") -> int:
    """
    Chuyển giá tiền về đơn vị VND.
    Ví dụ:
    50 nghìn -> 50000
    1.5 triệu -> 1500000
    75k -> 75000
    """

    value = float(amount.replace(",", "."))
    unit = (unit or "").lower()

    if unit in ["triệu", "tr"]:
        value *= 1_000_000

    elif unit in ["nghìn", "ngàn", "k", "ng"]:
        value *= 1_000

    return int(value)


def extract_reservation_date(text: str):
    """
    Nhận diện ngày đặt bàn.
    Hỗ trợ:
    - hôm nay
    - ngày mai
    - ngày kia
    - ngày 20/11
    - ngày 20/11/2026
    - ngày 20 tháng 11
    """

    today = datetime.now(
        ZoneInfo("Asia/Ho_Chi_Minh")
    ).date()

    text = text.lower()

    # Ngày tương đối
    if "ngày kia" in text or "ngày mốt" in text:
        return today + timedelta(days=2)

    if "ngày mai" in text:
        return today + timedelta(days=1)

    if "hôm nay" in text:
        return today

    # Dạng: ngày 20/11 hoặc 20-11-2026
    date_match = re.search(
        r"(?:ngày\s*)?(\d{1,2})[/-](\d{1,2})(?:[/-](\d{2,4}))?",
        text
    )

    if date_match:
        day = int(date_match.group(1))
        month = int(date_match.group(2))
        year_text = date_match.group(3)

        year = int(year_text) if year_text else today.year

        if year < 100:
            year += 2000

        try:
            return date(year, month, day)
        except ValueError:
            return None

    # Dạng: ngày 20 tháng 11
    month_match = re.search(
        r"ngày\s+(\d{1,2})\s+tháng\s+(\d{1,2})(?:\s+năm\s+(\d{4}))?",
        text
    )

    if month_match:
        day = int(month_match.group(1))
        month = int(month_match.group(2))
        year = int(month_match.group(3)) if month_match.group(3) else today.year

        try:
            return date(year, month, day)
        except ValueError:
            return None

    return None


def extract_reservation_time(text: str):
    """
    Nhận diện giờ đặt bàn.
    Hỗ trợ:
    - 18:30
    - 18h30
    - 18 giờ
    - 7 giờ tối
    - 7 giờ sáng
    """

    text = text.lower()

    # Dạng 18:30 hoặc 18h30
    time_match = re.search(
        r"\b(\d{1,2})\s*(?::|h)\s*(\d{2})\s*(sáng|trưa|chiều|tối)?\b",
        text
    )

    if time_match:
        hour = int(time_match.group(1))
        minute = int(time_match.group(2))
        period = time_match.group(3)

    else:
        # Dạng 18 giờ hoặc 7 giờ tối
        time_match = re.search(
            r"\b(\d{1,2})\s*giờ"
            r"(?:\s*(\d{1,2})\s*phút)?"
            r"\s*(sáng|trưa|chiều|tối)?\b",
            text
        )

        if not time_match:
            return None

        hour = int(time_match.group(1))
        minute = int(time_match.group(2) or 0)
        period = time_match.group(3)

    if hour > 23 or minute > 59:
        return None

    # Chuyển giờ 12 tiếng sang 24 tiếng
    if period == "sáng":
        if hour == 12:
            hour = 0

    elif period in ["chiều", "tối"]:
        if 1 <= hour <= 11:
            hour += 12

    elif period == "trưa":
        if 1 <= hour <= 10:
            hour += 12

    return f"{hour:02d}:{minute:02d}"


def extract_entities(text: str) -> dict:
    """
    Trích xuất thông tin từ câu hỏi khách hàng.
    """

    text_lower = text.lower().strip()

    entities = {
        "price_min": None,
        "price_max": None,
        "guest_count": None,
        "dish_name": None,
        "reservation_date": None,
        "reservation_time": None,
        "reservation_datetime": None
    }

    # Các đơn vị tiền tệ
    number_pattern = r"\d+(?:[.,]\d+)?"
    unit_pattern = r"triệu|tr|nghìn|ngàn|ng|k|đồng|đ"

    # 1. Trích xuất khoảng giá
    range_match = re.search(
        rf"từ\s*({number_pattern})\s*({unit_pattern})?"
        rf"\s*đến\s*({number_pattern})\s*({unit_pattern})?",
        text_lower
    )

    if range_match:
        amount_min = range_match.group(1)
        unit_min = range_match.group(2)

        amount_max = range_match.group(3)
        unit_max = range_match.group(4)

        if unit_min is None:
            unit_min = unit_max

        if unit_max is None:
            unit_max = unit_min

        entities["price_min"] = normalize_price(
            amount_min,
            unit_min
        )

        entities["price_max"] = normalize_price(
            amount_max,
            unit_max
        )

    else:
        # 2. Trích xuất giá tối đa
        max_match = re.search(
            rf"(?:dưới|nhỏ hơn|thấp hơn|ít hơn|tối đa|không quá)"
            rf"\s*({number_pattern})\s*({unit_pattern})?",
            text_lower
        )

        # 3. Trích xuất giá tối thiểu
        min_match = re.search(
            rf"(?:trên|lớn hơn|cao hơn|nhiều hơn|từ)"
            rf"\s*({number_pattern})\s*({unit_pattern})?",
            text_lower
        )

        if max_match:
            entities["price_max"] = normalize_price(
                max_match.group(1),
                max_match.group(2)
            )

        if min_match:
            entities["price_min"] = normalize_price(
                min_match.group(1),
                min_match.group(2)
            )

    # 4. Trích xuất số lượng khách
    guest_match = re.search(
        r"(\d+)\s*(người|khách)",
        text_lower
    )

    if guest_match:
        entities["guest_count"] = int(
            guest_match.group(1)
        )

    # 5. Trích xuất tên món ăn
    dishes = [
        "bún bò",
        "cơm chiên",
        "cơm tấm",
        "bánh mì",
        "gà rán",
        "mì xào",
        "phở",
        "pizza",
        "lẩu"
    ]

    for dish in dishes:
        if dish in text_lower:
            entities["dish_name"] = dish
            break

    # 6. Trích xuất ngày đặt bàn
    reservation_date = extract_reservation_date(text_lower)

    if reservation_date:
        entities["reservation_date"] = reservation_date.isoformat()

    # 7. Trích xuất giờ đặt bàn
    reservation_time = extract_reservation_time(text_lower)

    if reservation_time:
        entities["reservation_time"] = reservation_time

    # 8. Kết hợp ngày và giờ
    if reservation_date and reservation_time:
        entities["reservation_datetime"] = (
            f"{reservation_date.isoformat()}T{reservation_time}"
        )

    return entities
