
package com.example.restaurant_management.service;

import java.util.List;

import com.example.restaurant_management.dto.Promotion;
import com.example.restaurant_management.dto.PromotionResponse;

public interface PromotionService {

    // Lấy tất cả khuyến mãi dành cho quản lý
    List<PromotionResponse> getAllPromotions();

    // Lấy các khuyến mãi hiện đang có hiệu lực
    List<PromotionResponse> getAvailablePromotions();

    // Lấy khuyến mãi theo ID
    PromotionResponse getPromotionById(Integer promotionId);

    // Tạo khuyến mãi
    PromotionResponse createPromotion(Promotion promotion);

    // Cập nhật khuyến mãi
    PromotionResponse updatePromotion(Integer promotionId, Promotion promotion);

    // Kích hoạt / ngừng kích hoạt khuyến mãi
    PromotionResponse updateActiveStatus(Integer promotionId, Boolean isActive);
}
