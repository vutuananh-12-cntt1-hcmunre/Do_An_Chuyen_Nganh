package com.example.restaurant_management.dto;

import jakarta.validation.constraints.NotBlank;

public record ChatRequest(
        @NotBlank(message = "Nội dung tin nhắn không được để trống")
        String message
) {
}