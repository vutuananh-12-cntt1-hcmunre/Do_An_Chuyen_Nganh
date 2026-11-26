
package com.example.restaurant_management.service;

import java.util.List;

import com.example.restaurant_management.dto.KitchenOrderItemResponse;

public interface KitchenService {

    // Lấy danh sách các món đang chờ hoặc đang chế biến
    List<KitchenOrderItemResponse> getKitchenItems();

    // Chuyển món sang trạng thái đang chế biến
    void startPreparing(Integer orderItemId);

    // Đánh dấu món đã chế biến xong
    void completeItem(Integer orderItemId);
    List<KitchenOrderItemResponse> getCompletedKitchenItems();
}
