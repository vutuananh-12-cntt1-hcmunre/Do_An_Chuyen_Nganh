
package com.example.restaurant_management.dto;

public record PopularDish(
        Integer dishId,
        String dishName,
        Long totalSold
) {
}
