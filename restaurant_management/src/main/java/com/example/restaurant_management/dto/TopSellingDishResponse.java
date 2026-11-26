package com.example.restaurant_management.dto;

public record TopSellingDishResponse(
    Integer dishId,
    String dishName,
    Long totalSold
) {}