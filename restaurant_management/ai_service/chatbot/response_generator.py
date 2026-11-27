"""
Sinh câu trả lời chatbot linh hoạt theo intent + entities.
Nhiều mẫu ngẫu nhiên, gắn entity, tránh hỏi ngược chung chung.
"""
from __future__ import annotations

import random
import re
from typing import Any


def _fmt_money(value: int | None) -> str | None:
    if value is None:
        return None
    return f"{value:,}".replace(",", ".") + "đ"


def _pick(options: list[str]) -> str:
    return random.choice(options)


def generate_reply(
    intent: str,
    confidence: float,
    entities: dict[str, Any],
    user_message: str = "",
) -> str:
    entities = entities or {}
    intent = (intent or "UNKNOWN").upper()
    msg = (user_message or "").lower().strip()

    price_min = entities.get("price_min")
    price_max = entities.get("price_max")
    guest_count = entities.get("guest_count")
    dish_name = entities.get("dish_name")
    res_date = entities.get("reservation_date")
    res_time = entities.get("reservation_time")

    price_min_s = _fmt_money(price_min)
    price_max_s = _fmt_money(price_max)

    # Câu hỏi mở về menu (không chỉ định món)
    is_open_menu_question = any(
        phrase in msg
        for phrase in [
            "có món nào",
            "có món gì",
            "món gì",
            "menu có",
            "thực đơn",
            "có gì ăn",
            "ăn gì",
            "gợi ý món",
            "món ra sao",
            "bán những gì",
            "có những món",
        ]
    )

    # ----- GREETING -----
    if intent == "GREETING":
        return _pick(
            [
                "Chào bạn! Mình là trợ lý Bếp Mận & Lửa. Bên mình có món nước, cơm, đồ chiên và lẩu. Bạn muốn xem món, hỏi giá, khuyến mãi hay đặt bàn ạ?",
                "Xin chào! Rất vui được hỗ trợ. Bạn có thể hỏi món theo sở thích/ngân sách, món bán chạy, ưu đãi hoặc đặt bàn nhé.",
                "Hello bạn! Mình giúp tìm món, lọc theo giá, gợi ý món hot và hướng dẫn đặt bàn. Bạn cần gì trước ạ?",
            ]
        )

    # ----- FILTER_DISH -----
    if intent == "FILTER_DISH":
        if price_min_s and price_max_s:
            return _pick(
                [
                    f"Trong khoảng {price_min_s} – {price_max_s} thường có cơm, bún/phở phần thường và vài món ăn nhanh. Bạn mở Thực đơn lọc đúng khoảng giá, hoặc nói thích món nước hay cơm để mình gợi ý sát hơn.",
                    f"Ngân sách {price_min_s} đến {price_max_s} là ổn. Phổ biến trong tầm này: món nước, cơm tấm, bánh mì/mì. Bạn nghiêng về món nào?",
                    f"Ok, khoảng {price_min_s}–{price_max_s}. Vào Thực đơn kéo bộ lọc giá giúp mình; muốn gợi ý nhanh thì nói thêm “món nước” hoặc “đồ chiên” nhé.",
                ]
            )
        if price_max_s:
            return _pick(
                [
                    f"Dưới {price_max_s} vẫn chọn được món ổn — thường là phần thường, món nước hoặc ăn nhanh. Bạn thử lọc giá trên Thực đơn, hoặc nói mình thích kiểu món gì.",
                    f"Ngân sách tối đa {price_max_s}: ưu tiên cơm/bún phần nhỏ và món bán chạy giá mềm. Bạn muốn món nước hay món khô ạ?",
                    f"Dưới {price_max_s} mình khuyên xem nhóm món bình dân trên Thực đơn. Cứ nói thêm 1–2 từ khóa (phở, cơm, gà…) là gợi ý cụ thể hơn được.",
                ]
            )
        if price_min_s:
            return _pick(
                [
                    f"Từ {price_min_s} trở lên thường là phần lớn, món đặc sắc hoặc set/lẩu. Bạn mở Thực đơn lọc “trên {price_min_s}”, hoặc cho mình biết thích nướng, lẩu hay món Việt.",
                    f"Tầm từ {price_min_s}+ có nhiều lựa chọn đậm đà hơn. Bạn đi mấy người và thích chia sẻ (lẩu) hay phần riêng?",
                ]
            )
        return _pick(
            [
                "Bạn muốn lọc theo giá nào ạ? Ví dụ: “món dưới 50 nghìn” hoặc “từ 30k đến 80k” — mình sẽ định hướng nhóm món phù hợp.",
                "Cho mình khoảng giá cụ thể nhé (dưới bao nhiêu / từ–đến). Kèm theo “món nước” hoặc “cơm” nếu có, gợi ý sẽ sát hơn.",
            ]
        )

    # ----- FIND_DISH -----
    if intent == "FIND_DISH":
        if dish_name:
            return _pick(
                [
                    f"Bạn đang hỏi “{dish_name.title()}”. Nếu món còn phục vụ sẽ có trên Thực đơn kèm giá. Bạn mở Thực đơn tìm “{dish_name}”; hết món thì nhân viên có thể gợi ý món gần giống.",
                    f"“{dish_name.title()}” là lựa chọn hay. Kiểm tra nhanh trên Thực đơn giúp mình — thấy giá và mô tả ở đó. Cần so với món tương tự cứ nhắn thêm.",
                    f"Có hướng “{dish_name.title()}” rồi. Vào Thực đơn gõ tên món để xem còn phục vụ không; muốn mình gợi ý món thay thế cùng kiểu cũng được.",
                ]
            )

        # Câu mở: có món nào / menu có gì / ăn gì...
        if is_open_menu_question:
            return _pick(
                [
                    "Bên mình có món nước (phở, bún), cơm, đồ chiên/gà và lẩu chia sẻ. Bạn thích món nước hay cơm? Hoặc nói ngân sách (vd dưới 50k) mình gợi ý sát hơn — cũng có thể mở mục Thực đơn xem full list.",
                    "Menu khá đa dạng: món Việt, món nước, cơm tấm và món dùng chung. Ăn một mình hay đi nhóm? Nói thêm sở thích hoặc khoảng giá để mình gợi ý nhanh.",
                    "Nhà hàng phục vụ món nước, cơm, đồ chiên và lẩu. Bạn muốn ăn nhẹ, no bụng, hay đang tìm món bán chạy? Cứ nói 1 ý chính, mình định hướng tiếp.",
                    "Có khá nhiều lựa chọn trên Thực đơn. Gợi ý nhanh: món nước dễ ăn, cơm no lâu, lẩu hợp nhóm. Bạn nghiêng hướng nào hoặc budget khoảng bao nhiêu?",
                ]
            )

        return _pick(
            [
                "Bạn có thể mở Thực đơn để xem full list. Muốn mình gợi ý nhanh thì nói kiểu món (nước/cơm/lẩu), ngân sách, hoặc tên món cụ thể nhé.",
                "Mình hỗ trợ tìm món theo tên, theo giá hoặc theo sở thích. Ví dụ: “phở”, “món dưới 50k”, “món cho 4 người”. Bạn thử một câu ngắn giúp mình.",
                "Bạn thích món nước, cơm hay đồ cay? Nói thêm ngân sách nếu có — mình gợi ý hướng chọn trên menu cho dễ.",
            ]
        )

    # ----- POPULAR_DISH -----
    if intent == "POPULAR_DISH":
        return _pick(
            [
                "Món khách gọi nhiều thường là món dễ ăn, giá ổn: phở/bún, cơm tấm, gà và đôi khi lẩu (tùy ngày). Bạn vào Thực đơn xem nhóm bán chạy, hoặc hỏi quầy món hot trong ngày.",
                "An toàn miệng thì chọn món nước hoặc cơm tấm — gần như lúc nào cũng được gọi. Bạn ăn một mình hay đi nhóm để mình gợi ý phần/phần chia sẻ?",
                "Top gọi hay xoay quanh món quốc dân và combo giá mềm. Bạn nghiêng món nước hay món khô? Mình gợi ý combo hợp lý hơn.",
            ]
        )

    # ----- FIND_PROMOTION -----
    if intent == "FIND_PROMOTION":
        return _pick(
            [
                "Ưu đãi đổi theo tuần/khung giờ. Bạn xem mục Khuyến mãi trên app hoặc hỏi quầy — đôi khi có combo và giảm theo giờ. Đi ngày thường hay cuối tuần ạ?",
                "Có thể có voucher/combo tùy chương trình. Kiểm tra Khuyến mãi trước khi order giúp mình; nói thêm số người hoặc ngân sách để gợi ý cách dùng ưu đãi.",
                "Muốn săn giảm giá thì xem Khuyến mãi trước. Bạn cần ưu đãi cho nhóm đặt bàn hay order mang về?",
            ]
        )

    # ----- RESERVE_TABLE -----
    if intent == "RESERVE_TABLE":
        bits = []
        if guest_count:
            bits.append(f"{guest_count} khách")
        if res_date:
            bits.append(f"ngày {res_date}")
        if res_time:
            bits.append(f"lúc {res_time}")
        detail = ", ".join(bits)

        if detail:
            return _pick(
                [
                    f"Mình đã ghi nhận: đặt bàn {detail}. Bạn vào mục Đặt bàn để gửi chính thức (tên + SĐT). Giờ đông nên đặt sớm giúp mình nhé!",
                    f"Ok — {detail}. Hoàn tất trên trang Đặt bàn để hệ thống giữ chỗ; đổi giờ cứ nhắn lại.",
                    f"Đã nắm {detail}. Xác nhận giúp trên form Đặt bàn. Cần bàn yên / gần cửa sổ có thể ghi chú khi gửi form.",
                ]
            )

        missing = []
        if not guest_count:
            missing.append("số người")
        if not res_date:
            missing.append("ngày")
        if not res_time:
            missing.append("giờ")
        need = ", ".join(missing) if missing else "thêm thông tin"

        return _pick(
            [
                f"Bạn muốn đặt bàn ạ. Cho mình thêm {need} — ví dụ: “đặt bàn 4 người ngày mai 18h30”.",
                f"Để giữ chỗ chính xác, mình cần {need}. Nhắn một câu đủ ý, mình hướng dẫn gửi form Đặt bàn.",
                "Đặt bàn hỗ trợ qua mục Đặt bàn. Bạn cho mình biết số người và khoảng giờ mong muốn nhé.",
            ]
        )

    # ----- THANKS -----
    if intent == "THANKS":
        return _pick(
            [
                "Không có chi ạ! Cần gì thêm cứ nhắn mình.",
                "Rất vui được giúp bạn. Chúc bạn có bữa ăn ngon!",
                "Có gì cứ hỏi tiếp nhé. Mình luôn ở đây hỗ trợ.",
            ]
        )

    # ----- GOODBYE -----
    if intent == "GOODBYE":
        return _pick(
            [
                "Tạm biệt bạn! Hẹn gặp lại tại Bếp Mận & Lửa.",
                "Bye bạn nhé — chúc một ngày vui vẻ!",
                "Hẹn sớm gặp bạn. Giữ sức khỏe nhé!",
            ]
        )

    # ----- OPENING_HOURS -----
    if intent == "OPENING_HOURS":
        return _pick(
            [
                "Giờ phục vụ theo lịch nhà hàng (có thể đổi ngày lễ). Bạn xem thông tin trên trang chủ hoặc gọi trực tiếp để chắc khung giờ hôm nay nhé.",
                "Nhà hàng mở theo khung sáng–tối trong tuần; cuối tuần thường đông hơn. Bạn định đến lúc mấy giờ để mình nhắc đặt bàn sớm?",
            ]
        )

    # ----- CONTACT -----
    if intent == "CONTACT":
        return _pick(
            [
                "Số điện thoại và địa chỉ nằm ở trang chủ / phần Liên hệ. Đặt bàn online rồi chờ xác nhận cũng được nhé.",
                "Thông tin liên hệ xem ở footer website hoặc mục Liên hệ. Cần giữ chỗ gấp thì gọi trực tiếp nhanh nhất.",
            ]
        )

    # ----- UNKNOWN / confidence thấp -----
    if intent == "UNKNOWN" or confidence < 0.35:
        if any(w in msg for w in ["giá", "bao nhiêu", "rẻ", "đắt"]):
            return _pick(
                [
                    "Bạn đang hỏi về giá phải không? Thử nói “món dưới 50k” hoặc “từ 40 đến 80 nghìn”, mình định hướng nhóm món giúp.",
                    "Cho mình khoảng ngân sách cụ thể nhé — ví dụ dưới 50 nghìn — để gợi ý sát hơn.",
                ]
            )
        if any(w in msg for w in ["bàn", "đặt chỗ", "reservation", "giữ chỗ"]):
            return (
                "Bạn muốn đặt bàn đúng không? Nhắn giúp số người + ngày + giờ "
                "(vd: đặt 3 người tối nay 19h)."
            )
        if any(w in msg for w in ["giờ", "mở cửa", "đóng cửa", "mấy giờ"]):
            return (
                "Bạn đang hỏi giờ mở cửa. Xem thông tin trên trang chủ hoặc "
                "gọi nhà hàng để chắc lịch hôm nay nhé."
            )
        if is_open_menu_question:
            return _pick(
                [
                    "Bên mình có món nước, cơm, đồ chiên và lẩu. Bạn thích hướng nào, hoặc nói ngân sách để mình gợi ý nhanh — cũng có thể mở Thực đơn xem full.",
                    "Menu đa dạng món Việt và món chia sẻ. Bạn muốn ăn nhẹ hay no, đi một mình hay nhóm?",
                ]
            )

        return _pick(
            [
                "Mình chưa nắm rõ ý bạn. Bạn có thể hỏi: món có gì, lọc theo giá, món bán chạy, khuyến mãi hoặc đặt bàn ạ.",
                "Xin lỗi, mình chưa hiểu trọn. Thử câu ngắn — ví dụ “có món gì”, “món dưới 50k”, “đặt bàn 4 người ngày mai 18h”.",
                "Bạn diễn đạt lại giúp mình được không? Mình hỗ trợ tốt: gợi ý món, giá, khuyến mãi và đặt bàn.",
            ]
        )

    return _pick(
        [
            "Mình đã nhận câu hỏi. Bạn muốn hỗ trợ tìm món, theo giá, khuyến mãi hay đặt bàn ạ?",
            "Nói rõ thêm một chút về món hoặc nhu cầu (giá / đặt bàn / ưu đãi), mình trả lời cụ thể hơn.",
        ]
    )


def enrich_with_soft_intents(text: str, intent: str) -> str:
    """Bổ sung intent mềm khi classifier trả UNKNOWN nhưng câu rõ nghĩa."""
    if intent != "UNKNOWN":
        return intent

    t = (text or "").lower()
    if re.search(r"\b(cảm ơn|thanks|thank you|cám ơn)\b", t):
        return "THANKS"
    if re.search(r"\b(tạm biệt|bye|goodbye|hẹn gặp)\b", t):
        return "GOODBYE"
    if any(k in t for k in ["giờ mở", "mở cửa", "đóng cửa", "mấy giờ mở"]):
        return "OPENING_HOURS"
    if any(k in t for k in ["địa chỉ", "số điện thoại", "hotline", "liên hệ", "ở đâu"]):
        return "CONTACT"
    return intent
