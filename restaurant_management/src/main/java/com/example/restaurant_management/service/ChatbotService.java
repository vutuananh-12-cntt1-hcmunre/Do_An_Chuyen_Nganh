package com.example.restaurant_management.service;

import java.util.List;

import com.example.restaurant_management.dto.ChatbotMessageResponse;
import com.example.restaurant_management.repository.ChatMessageRepository.ChatMessage;

public interface ChatbotService {

    // Xử lý tin nhắn của người dùng
    ChatbotMessageResponse processMessage(
            String username,
            String message
    );

    // Lấy lịch sử trò chuyện
    List<ChatMessage> getChatHistory(
            String username,
            Integer sessionId
    );

    // Đóng phiên trò chuyện
    void closeChatSession(
            String username,
            Integer sessionId
    );
}