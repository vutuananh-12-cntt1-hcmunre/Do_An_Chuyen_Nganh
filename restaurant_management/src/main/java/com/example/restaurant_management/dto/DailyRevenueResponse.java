package com.example.restaurant_management.dto;

import java.math.BigDecimal;
import java.time.LocalDate;

public record DailyRevenueResponse(
    LocalDate revenueDate,
    BigDecimal revenue
) {}
