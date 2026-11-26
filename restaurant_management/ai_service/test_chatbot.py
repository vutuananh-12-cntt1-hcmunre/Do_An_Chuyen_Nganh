
from chatbot.intent_classifier import classify_intent

questions = [
    "Nhà hàng có món phở không?",
    "Có món nào dưới 50000 đồng không?",
    "Hiện tại có khuyến mãi gì?",
    "Món nào được khách gọi nhiều nhất?",
    "Tôi muốn đặt bàn cho 4 người",
    "Xin chào"
]

for question in questions:
    result = classify_intent(question)

    print("Câu hỏi:", question)
    print("Kết quả:", result)
    print("-" * 50)
