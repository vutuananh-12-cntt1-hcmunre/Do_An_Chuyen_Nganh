package com.example.restaurant_management.dto;

import java.math.BigDecimal;

public record StatisticsOverviewResponse(
    Long totalOrders,
    Long completedOrders,
    BigDecimal totalRevenue
) {}