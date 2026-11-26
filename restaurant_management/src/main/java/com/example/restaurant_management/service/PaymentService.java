package com.example.restaurant_management.service;

import java.util.List;

import com.example.restaurant_management.dto.PaymentRequest;
import com.example.restaurant_management.dto.PaymentResponse;

public interface PaymentService {

    // Lấy danh sách tất cả thanh toán
    List<PaymentResponse> getAllPayments();

    // Lấy thông tin thanh toán theo ID
    PaymentResponse getPaymentById(Integer paymentId);

    // Lấy danh sách thanh toán theo đơn hàng
    List<PaymentResponse> getPaymentsByOrderId(Integer orderId);

    // Tạo yêu cầu thanh toán
    PaymentResponse createPayment(PaymentRequest request);

    // Xác nhận thanh toán thành công
    void confirmPayment(Integer paymentId);

    // Đánh dấu thanh toán thất bại
    void failPayment(Integer paymentId);

    // Hoàn tiền
    void refundPayment(Integer paymentId);
}