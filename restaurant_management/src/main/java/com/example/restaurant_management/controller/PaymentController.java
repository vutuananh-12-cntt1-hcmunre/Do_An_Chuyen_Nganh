package com.example.restaurant_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.restaurant_management.dto.PaymentRequest;
import com.example.restaurant_management.dto.PaymentResponse;
import com.example.restaurant_management.service.PaymentService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;

    public PaymentController(PaymentService paymentService) {
        this.paymentService = paymentService;
    }

    // Lấy tất cả thanh toán
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<PaymentResponse>> getAllPayments() {
        return ResponseEntity.ok(paymentService.getAllPayments());
    }

    // Lấy thanh toán theo ID
    @GetMapping("/{paymentId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<PaymentResponse> getPaymentById(
            @PathVariable Integer paymentId) {

        return ResponseEntity.ok(
                paymentService.getPaymentById(paymentId));
    }

    // Lấy thanh toán theo đơn hàng
    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<List<PaymentResponse>> getPaymentsByOrderId(
            @PathVariable Integer orderId) {

        return ResponseEntity.ok(
                paymentService.getPaymentsByOrderId(orderId));
    }

    // Tạo yêu cầu thanh toán
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<PaymentResponse> createPayment(
            @Valid @RequestBody PaymentRequest request) {

        PaymentResponse response =
                paymentService.createPayment(request);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Xác nhận thanh toán
    @PatchMapping("/{paymentId}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<String> confirmPayment(
            @PathVariable Integer paymentId) {

        paymentService.confirmPayment(paymentId);

        return ResponseEntity.ok("Xác nhận thanh toán thành công");
    }

    // Đánh dấu thanh toán thất bại
    @PatchMapping("/{paymentId}/fail")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<String> failPayment(
            @PathVariable Integer paymentId) {

        paymentService.failPayment(paymentId);

        return ResponseEntity.ok("Đã đánh dấu thanh toán thất bại");
    }

    // Hoàn tiền
    @PatchMapping("/{paymentId}/refund")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<String> refundPayment(
            @PathVariable Integer paymentId) {

        paymentService.refundPayment(paymentId);

        return ResponseEntity.ok("Hoàn tiền thành công");
    }
}