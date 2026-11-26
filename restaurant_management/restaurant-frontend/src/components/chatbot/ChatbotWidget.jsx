
import { useState } from "react";
import {
  Bot,
  X,
  Send,
  User,
  MessageCircle,
  LoaderCircle,
} from "lucide-react";

import api from "../../services/api";
import "./ChatbotWidget.css";

export default function ChatbotWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [messages, setMessages] = useState([
    {
      id: 1,
      sender: "BOT",
      content:
        "Xin chào! Mình là trợ lý ảo của Bếp Mận & Lửa. Bạn muốn tìm món ăn, hỏi về giá hay cần tư vấn đặt bàn?",
    },
  ]);
  const [isSending, setIsSending] = useState(false);

  async function sendMessage(event) {
    event.preventDefault();

    const content = message.trim();

    if (!content || isSending) return;

    // Hiển thị tin nhắn khách hàng ngay lập tức.
    const customerMessage = {
      id: Date.now(),
      sender: "CUSTOMER",
      content,
    };

    setMessages((current) => [...current, customerMessage]);
    setMessage("");
    setIsSending(true);

    try {
      // Gửi tin nhắn đến Spring Boot.
      const response = await api.post("/chatbot/message", {
        message: content,
      });

      console.log("===== CHATBOT API SUCCESS =====");
      console.log("Status:", response.status);
      console.log("Response data:", response.data);

      const result = response.data?.data ?? response.data;

      // Lấy nội dung phản hồi từ chatbot.
      const botContent =
        typeof result?.message === "string"
          ? result.message
          : result?.message?.messageContent ??
            result?.message?.content ??
            result?.botMessage ??
            result?.response ??
            result?.reply ??
            "Trợ lý đã nhận được câu hỏi nhưng chưa có nội dung phản hồi.";

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          sender: "BOT",
          content: botContent,
        },
      ]);
    } catch (error) {
      console.error("===== CHATBOT API ERROR =====");
      console.error("Request URL:", error.config?.url);
      console.error("HTTP Status:", error.response?.status);
      console.error("Response data:", error.response?.data);
      console.error("Error message:", error.message);

      const status = error.response?.status;
      const errorData = error.response?.data;

      let errorMessage =
        errorData?.message ||
        errorData?.error ||
        "";

      if (!errorMessage) {
        if (status === 400) {
          errorMessage = "Yêu cầu không hợp lệ. Vui lòng thử lại.";
        } else if (status === 401) {
          errorMessage =
            "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.";
        } else if (status === 403) {
          errorMessage =
            "Tài khoản không có quyền sử dụng trợ lý ảo.";
        } else if (status === 404) {
          errorMessage =
            "Không tìm thấy API chatbot. Vui lòng kiểm tra endpoint backend.";
        } else if (status >= 500) {
          errorMessage =
            "Máy chủ chatbot đang gặp lỗi. Vui lòng thử lại sau.";
        } else if (!error.response) {
          errorMessage =
            "Không thể kết nối đến máy chủ. Vui lòng kiểm tra backend.";
        } else {
          errorMessage =
            "Trợ lý ảo chưa thể phản hồi. Vui lòng thử lại.";
        }
      }

      setMessages((current) => [
        ...current,
        {
          id: Date.now() + 1,
          sender: "BOT",
          content: errorMessage,
        },
      ]);
    } finally {
      setIsSending(false);
    }
  }

  return (
    <div className="chatbot-widget">
      {/* KHUNG CHAT */}
      {isOpen && (
        <section className="chatbot-window">
          {/* HEADER */}
          <header className="chatbot-header">
            <div className="chatbot-header-info">
              <div className="chatbot-avatar">
                <Bot size={22} />
              </div>

              <div>
                <strong>Trợ lý Bếp Mận & Lửa</strong>

                <span>
                  <i className="chatbot-online-dot" />
                  Đang hỗ trợ
                </span>
              </div>
            </div>

            <button
              type="button"
              className="chatbot-close"
              onClick={() => setIsOpen(false)}
              aria-label="Đóng chatbot"
            >
              <X size={20} />
            </button>
          </header>

          {/* NỘI DUNG TIN NHẮN */}
          <div className="chatbot-messages">
            <div className="chatbot-welcome">
              TRỢ LÝ ẨM THỰC · BẾP MẬN & LỬA
            </div>

            {messages.map((item) => (
              <div
                key={item.id}
                className={`chatbot-message-row ${
                  item.sender === "CUSTOMER"
                    ? "customer-message"
                    : "bot-message"
                }`}
              >
                {item.sender === "BOT" && (
                  <div className="chatbot-message-avatar">
                    <Bot size={15} />
                  </div>
                )}

                <div className="chatbot-message-content">
                  {item.content}
                </div>

                {item.sender === "CUSTOMER" && (
                  <div className="chatbot-message-avatar customer-avatar">
                    <User size={15} />
                  </div>
                )}
              </div>
            ))}

            {/* TRẠNG THÁI ĐANG XỬ LÝ */}
            {isSending && (
              <div className="chatbot-typing">
                <LoaderCircle
                  size={15}
                  className="chatbot-spinner"
                />
                Trợ lý đang suy nghĩ...
              </div>
            )}
          </div>

          {/* Ô NHẬP TIN NHẮN */}
          <form
            className="chatbot-input-area"
            onSubmit={sendMessage}
          >
            <input
              type="text"
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              placeholder="Hỏi về món ăn, giá cả..."
              disabled={isSending}
            />

            <button
              type="submit"
              disabled={!message.trim() || isSending}
              aria-label="Gửi tin nhắn"
            >
              {isSending ? (
                <LoaderCircle
                  size={18}
                  className="chatbot-spinner"
                />
              ) : (
                <Send size={18} />
              )}
            </button>
          </form>

          <div className="chatbot-footer">
            Trợ lý ảo Bếp Mận & Lửa
          </div>
        </section>
      )}

      {/* NÚT CHATBOT NỔI */}
      <button
        type="button"
        className={`chatbot-floating-button ${
          isOpen ? "is-open" : ""
        }`}
        onClick={() => setIsOpen((current) => !current)}
        aria-label={isOpen ? "Đóng chatbot" : "Mở chatbot"}
      >
        {isOpen ? (
          <X size={25} />
        ) : (
          <MessageCircle size={25} />
        )}

        {!isOpen && (
          <span className="chatbot-button-label">
            Chat với chúng tôi
          </span>
        )}
      </button>
    </div>
  );
}
