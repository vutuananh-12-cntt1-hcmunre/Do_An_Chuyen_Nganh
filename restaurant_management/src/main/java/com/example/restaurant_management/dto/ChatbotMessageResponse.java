package com.example.restaurant_management.dto;

public record ChatbotMessageResponse(
        Integer sessionId,
        String message
) {
}