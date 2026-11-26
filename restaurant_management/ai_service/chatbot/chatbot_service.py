
from chatbot.intent_classifier import classify_intent
from chatbot.entity_extractor import extract_entities


def process_message(text: str) -> dict:
    """
    Xử lý câu hỏi khách hàng:
    - Nhận diện ý định
    - Trích xuất thông tin
    """

    intent_result = classify_intent(text)
    entities = extract_entities(text)

    return {
        "intent": intent_result["intent"],
        "confidence": intent_result["confidence"],
        "entities": entities
    }
