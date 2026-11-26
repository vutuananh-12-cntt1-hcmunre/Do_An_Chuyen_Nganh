
package com.example.restaurant_management.service;

import java.util.List;

import com.example.restaurant_management.dto.FeedbackRequest;
import com.example.restaurant_management.dto.FeedbackResponse;
import com.example.restaurant_management.dto.FeedbackStatisticsResponse;

public interface FeedbackService {

    FeedbackResponse create(String username, FeedbackRequest request);

    List<FeedbackResponse> findAll();

    FeedbackResponse findById(Integer feedbackId);

    boolean updateStatus(Integer feedbackId, String feedbackStatus);

    List<FeedbackResponse> findByFilters(String status, String sentiment);

    FeedbackStatisticsResponse getStatistics();

    // Lấy đánh giá của một đơn hàng thuộc Customer đang đăng nhập
    List<FeedbackResponse> findByOrder(String username, Integer orderId);
}
