package com.example.restaurant_management.controller;

import java.time.LocalDate;
import java.util.List;

import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.restaurant_management.dto.DailyRevenueResponse;
import com.example.restaurant_management.dto.StatisticsOverviewResponse;
import com.example.restaurant_management.dto.TopSellingDishResponse;
import com.example.restaurant_management.service.StatisticsService;

@RestController
@RequestMapping("/api/statistics")
public class StatisticsController {

    private final StatisticsService statisticsService;

    public StatisticsController(StatisticsService statisticsService) {
        this.statisticsService = statisticsService;
    }

    // GET /api/statistics/overview
    @GetMapping("/overview")
    public StatisticsOverviewResponse getOverview() {
        return statisticsService.getOverview();
    }

    // GET /api/statistics/revenue?fromDate=2026-11-01&toDate=2026-11-30
    @GetMapping("/revenue")
    public List<DailyRevenueResponse> getDailyRevenue(
            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate fromDate,

            @RequestParam
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE)
            LocalDate toDate) {

        return statisticsService.getDailyRevenue(fromDate, toDate);
    }

    // GET /api/statistics/top-dishes?limit=5
    @GetMapping("/top-dishes")
    public List<TopSellingDishResponse> getTopSellingDishes(
            @RequestParam(defaultValue = "5") int limit) {

        return statisticsService.getTopSellingDishes(limit);
    }
}