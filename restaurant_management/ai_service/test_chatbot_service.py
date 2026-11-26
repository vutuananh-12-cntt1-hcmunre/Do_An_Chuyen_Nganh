
from chatbot.chatbot_service import process_message


questions = [
    "Nhà hàng có món phở không?",
    "Có món bún bò dưới 50 nghìn không?",
    "Tôi muốn đặt bàn cho 4 người",
    "Hiện tại có khuyến mãi gì?",
    "Món nào được khách gọi nhiều nhất?"
]

for question in questions:
    print("Câu hỏi:", question)
    print("Kết quả:", process_message(question))
    print("-" * 60)
