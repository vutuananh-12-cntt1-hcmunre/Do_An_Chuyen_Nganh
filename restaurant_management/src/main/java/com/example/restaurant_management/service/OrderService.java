package com.example.restaurant_management.service;

import java.util.List;

import com.example.restaurant_management.dto.OrderRequest;
import com.example.restaurant_management.dto.OrderResponse;

public interface OrderService {

    // Lấy danh sách tất cả đơn hàng
    List<OrderResponse> getAllOrders();

    // Lấy thông tin đơn hàng theo ID
    OrderResponse getOrderById(Integer orderId);

    // Lấy danh sách đơn hàng của khách hàng đang đăng nhập
    List<OrderResponse> getMyOrders();

    // Tạo đơn hàng mới
    OrderResponse createOrder(OrderRequest request);

    // Xác nhận đơn hàng
    void confirmOrder(Integer orderId);

    // Hủy đơn hàng
    void cancelOrder(Integer orderId);

    // Chuyển đơn hàng sang trạng thái đang chế biến
    void startPreparing(Integer orderId);

    // Chuyển đơn hàng sang trạng thái sẵn sàng
    void markReady(Integer orderId);

    // Hoàn thành đơn hàng
    void completeOrder(Integer orderId);
}
