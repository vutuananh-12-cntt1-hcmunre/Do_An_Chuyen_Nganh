
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

import com.example.restaurant_management.dto.OrderRequest;
import com.example.restaurant_management.dto.OrderResponse;
import com.example.restaurant_management.service.OrderService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/orders")
public class OrderController {

    private final OrderService orderService;

    public OrderController(OrderService orderService) {
        this.orderService = orderService;
    }

    // 1. Lấy danh sách tất cả đơn hàng
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<OrderResponse>> getAllOrders() {

        return ResponseEntity.ok(orderService.getAllOrders());
    }

    // 2. Lấy danh sách đơn hàng của khách hàng đang đăng nhập
    @GetMapping("/my")
    @PreAuthorize("hasRole('CUSTOMER')")
    public ResponseEntity<List<OrderResponse>> getMyOrders() {

        return ResponseEntity.ok(orderService.getMyOrders());
    }

    // 3. Lấy chi tiết đơn hàng
    @GetMapping("/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<OrderResponse> getOrderById(
            @PathVariable Integer orderId) {

        return ResponseEntity.ok(
                orderService.getOrderById(orderId)
        );
    }

    // 4. Tạo đơn hàng
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<OrderResponse> createOrder(
            @Valid @RequestBody OrderRequest request) {

        OrderResponse response = orderService.createOrder(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // 5. Xác nhận đơn hàng
    @PatchMapping("/{orderId}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<String> confirmOrder(
            @PathVariable Integer orderId) {

        orderService.confirmOrder(orderId);

        return ResponseEntity.ok("Xác nhận đơn hàng thành công");
    }

    // 6. Hủy đơn hàng
    @PatchMapping("/{orderId}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<String> cancelOrder(
            @PathVariable Integer orderId) {

        orderService.cancelOrder(orderId);

        return ResponseEntity.ok("Hủy đơn hàng thành công");
    }

    // 7. Chuyển đơn hàng sang trạng thái đang chế biến
    @PatchMapping("/{orderId}/preparing")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<String> startPreparing(
            @PathVariable Integer orderId) {

        orderService.startPreparing(orderId);

        return ResponseEntity.ok("Đã chuyển đơn hàng sang đang chế biến");
    }

    // 8. Đánh dấu đơn hàng đã sẵn sàng
    @PatchMapping("/{orderId}/ready")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<String> markReady(
            @PathVariable Integer orderId) {

        orderService.markReady(orderId);

        return ResponseEntity.ok("Đơn hàng đã sẵn sàng");
    }

    // 9. Hoàn thành đơn hàng
    @PatchMapping("/{orderId}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<String> completeOrder(
            @PathVariable Integer orderId) {

        orderService.completeOrder(orderId);

        return ResponseEntity.ok("Hoàn thành đơn hàng thành công");
    }
}
