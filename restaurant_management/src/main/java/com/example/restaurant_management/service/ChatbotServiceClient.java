package com.example.restaurant_management.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.example.restaurant_management.dto.ChatRequest;
import com.example.restaurant_management.dto.ChatResponse;

@Service
public class ChatbotServiceClient {

    private final RestClient aiRestClient;

    public ChatbotServiceClient(RestClient aiRestClient) {
        this.aiRestClient = aiRestClient;
    }

    public ChatResponse processMessage(String message) {

        ChatRequest request = new ChatRequest(message);

        return aiRestClient.post()
                .uri("/chat")
                .body(request)
                .retrieve()
                .body(ChatResponse.class);
    }
}