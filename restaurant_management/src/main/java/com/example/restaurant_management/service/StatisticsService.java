package com.example.restaurant_management.service;

import java.time.LocalDate;
import java.util.List;

import com.example.restaurant_management.dto.DailyRevenueResponse;
import com.example.restaurant_management.dto.StatisticsOverviewResponse;
import com.example.restaurant_management.dto.TopSellingDishResponse;

public interface StatisticsService {

    StatisticsOverviewResponse getOverview();

    List<DailyRevenueResponse> getDailyRevenue(
        LocalDate fromDate, LocalDate toDate
    );

    List<TopSellingDishResponse> getTopSellingDishes(int limit);
}