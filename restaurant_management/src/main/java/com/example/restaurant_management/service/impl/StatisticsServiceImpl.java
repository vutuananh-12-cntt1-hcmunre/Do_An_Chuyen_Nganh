package com.example.restaurant_management.service.impl;

import java.time.LocalDate;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.restaurant_management.dto.DailyRevenueResponse;
import com.example.restaurant_management.dto.StatisticsOverviewResponse;
import com.example.restaurant_management.dto.TopSellingDishResponse;
import com.example.restaurant_management.repository.StatisticsRepository;
import com.example.restaurant_management.service.StatisticsService;

@Service
public class StatisticsServiceImpl implements StatisticsService {

    private final StatisticsRepository statisticsRepository;

    public StatisticsServiceImpl(
            StatisticsRepository statisticsRepository) {
        this.statisticsRepository = statisticsRepository;
    }

    @Override
    public StatisticsOverviewResponse getOverview() {
        return statisticsRepository.getOverview();
    }

    @Override
    public List<DailyRevenueResponse> getDailyRevenue(
            LocalDate fromDate, LocalDate toDate) {

        if (fromDate == null || toDate == null) {
            throw new IllegalArgumentException(
                "Vui lòng cung cấp ngày bắt đầu và ngày kết thúc"
            );
        }

        if (fromDate.isAfter(toDate)) {
            throw new IllegalArgumentException(
                "Ngày bắt đầu không được sau ngày kết thúc"
            );
        }

        return statisticsRepository.getDailyRevenue(fromDate, toDate);
    }

    @Override
    public List<TopSellingDishResponse> getTopSellingDishes(int limit) {

        if (limit < 1 || limit > 20) {
            throw new IllegalArgumentException(
                "Số lượng món ăn phải từ 1 đến 20"
            );
        }

        return statisticsRepository.getTopSellingDishes(limit);
    }
}