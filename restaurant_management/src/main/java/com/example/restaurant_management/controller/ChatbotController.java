
package com.example.restaurant_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.restaurant_management.dto.ChatRequest;
import com.example.restaurant_management.dto.ChatbotMessageResponse;
import com.example.restaurant_management.repository.ChatMessageRepository.ChatMessage;
import com.example.restaurant_management.service.ChatbotService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/chatbot")
public class ChatbotController {

    private final ChatbotService chatbotService;

    public ChatbotController(ChatbotService chatbotService) {
        this.chatbotService = chatbotService;
    }

    // Gửi tin nhắn đến chatbot
    @PostMapping("/message")
    public ResponseEntity<ChatbotMessageResponse> sendMessage(
            @Valid @RequestBody ChatRequest request,
            Authentication authentication) {

        String username = authentication.getName();

        ChatbotMessageResponse response =
                chatbotService.processMessage(
                        username,
                        request.message()
                );

        return ResponseEntity
                .status(HttpStatus.OK)
                .body(response);
    }

    // Lấy lịch sử tin nhắn của một phiên
    @GetMapping("/sessions/{sessionId}/messages")
    public ResponseEntity<List<ChatMessage>> getChatHistory(
            @PathVariable Integer sessionId,
            Authentication authentication) {

        String username = authentication.getName();

        List<ChatMessage> messages =
                chatbotService.getChatHistory(username, sessionId);

        return ResponseEntity.ok(messages);
    }

    // Đóng phiên trò chuyện
    @PatchMapping("/sessions/{sessionId}/close")
    public ResponseEntity<String> closeChatSession(
            @PathVariable Integer sessionId,
            Authentication authentication) {

        String username = authentication.getName();

        chatbotService.closeChatSession(username, sessionId);

        return ResponseEntity.ok(
                "Đã đóng phiên trò chuyện thành công."
        );
    }
}
