from chatbot.entity_extractor import extract_entities


questions = [
    "Có món nào dưới 50000 đồng không?",
    "Tôi muốn đặt bàn cho 4 người",
    "Nhà hàng có món phở không?",
    "Có món bún bò dưới 50 nghìn không?",
    "Tôi muốn đặt bàn cho 6 khách"
]

for question in questions:
    print("Câu hỏi:", question)
    print("Entities:", extract_entities(question))
    print("-" * 50)
