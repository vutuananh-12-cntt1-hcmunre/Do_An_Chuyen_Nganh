
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field

from predict_sentiment import predict_sentiment
from chatbot.chatbot_service import process_message


# =====================================
# 1. KHỞI TẠO FASTAPI
# =====================================

app = FastAPI(
    title="Restaurant AI Service",
    description=(
        "AI Service hỗ trợ phân tích cảm xúc phản hồi "
        "và chatbot tư vấn nhà hàng"
    ),
    version="2.0.0"
)


# =====================================
# 2. ĐỊNH NGHĨA REQUEST
# =====================================

class FeedbackRequest(BaseModel):
    text: str = Field(
        ...,
        min_length=1,
        description="Nội dung phản hồi của khách hàng"
    )


class ChatRequest(BaseModel):
    message: str = Field(
        ...,
        min_length=1,
        description="Tin nhắn của khách hàng"
    )


# =====================================
# 3. API KIỂM TRA TRẠNG THÁI
# =====================================

@app.get("/health")
def health_check():
    return {
        "status": "success",
        "message": "AI Service is running",
        "services": [
            "PhoBERT Sentiment Analysis",
            "Restaurant Chatbot NLP"
        ]
    }


# =====================================
# 4. API PHÂN TÍCH CẢM XÚC
# =====================================

@app.post("/predict")
def analyze_feedback(request: FeedbackRequest):

    try:
        result = predict_sentiment(request.text)

        return {
            "status": "success",
            "data": result
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Lỗi khi phân tích phản hồi"
        )


# =====================================
# 5. API CHATBOT TƯ VẤN NHÀ HÀNG
# =====================================

@app.post("/chat")
def chat(request: ChatRequest):

    try:
        result = process_message(request.message)

        return {
            "status": "success",
            "data": {
                "message": request.message,
                "intent": result["intent"],
                "confidence": result["confidence"],
                "entities": result["entities"],
                "reply": result["reply"],
                "response": result["reply"],
                "botMessage": result["reply"],
            }
        }

    except ValueError as error:
        raise HTTPException(
            status_code=400,
            detail=str(error)
        )

    except Exception:
        raise HTTPException(
            status_code=500,
            detail="Lỗi khi xử lý câu hỏi chatbot"
        )