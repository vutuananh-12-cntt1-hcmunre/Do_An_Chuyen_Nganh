from chatbot.intent_classifier import classify_intent
from chatbot.entity_extractor import extract_entities
from chatbot.response_generator import generate_reply, enrich_with_soft_intents


def process_message(text: str) -> dict:
    """
    Xử lý câu hỏi khách hàng:
    - Nhận diện ý định
    - Trích xuất thông tin
    - Sinh câu trả lời linh hoạt
    """
    if not text or not str(text).strip():
        return {
            "intent": "UNKNOWN",
            "confidence": 0.0,
            "entities": {},
            "reply": "Bạn cứ nhập câu hỏi nhé — ví dụ tìm món, hỏi giá hoặc đặt bàn.",
        }

    intent_result = classify_intent(text)
    intent = intent_result["intent"]
    confidence = float(intent_result.get("confidence") or 0.0)

    intent = enrich_with_soft_intents(text, intent)

    entities = extract_entities(text)
    reply = generate_reply(intent, confidence, entities, user_message=text)

    return {
        "intent": intent,
        "confidence": confidence,
        "entities": entities,
        "reply": reply,
    }