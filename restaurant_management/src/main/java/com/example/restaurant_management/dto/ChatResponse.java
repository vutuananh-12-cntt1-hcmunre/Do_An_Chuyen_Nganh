
package com.example.restaurant_management.dto;

public record ChatResponse(
        String status,
        ChatData data
) {
    public record ChatData(
            String message,
            String intent,
            double confidence,
            ChatEntities entities
    ) {
    }

    public record ChatEntities(
            Integer price_min,
            Integer price_max,
            Integer guest_count,
            String dish_name,
            String reservation_date,
            String reservation_time,
            String reservation_datetime
    ) {
    }
}
