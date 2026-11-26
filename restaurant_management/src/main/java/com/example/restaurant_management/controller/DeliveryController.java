
package com.example.restaurant_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.restaurant_management.dto.Delivery;
import com.example.restaurant_management.dto.DeliveryResponse;
import com.example.restaurant_management.service.DeliveryService;

@RestController
@RequestMapping("/api/deliveries")
public class DeliveryController {

    private final DeliveryService deliveryService;

    public DeliveryController(DeliveryService deliveryService) {
        this.deliveryService = deliveryService;
    }

    // Lấy username của tài khoản đang đăng nhập
    private String getCurrentUsername() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()) {
            throw new org.springframework.web.server.ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Bạn chưa đăng nhập"
            );
        }

        return authentication.getName();
    }

    // Kiểm tra tài khoản có quyền EMPLOYEE hay không
    private boolean isEmployee() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        return authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_EMPLOYEE"));
    }

    // Lấy danh sách giao hàng
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<DeliveryResponse>> getAllDeliveries() {

        List<DeliveryResponse> deliveries;

        if (isEmployee()) {
            deliveries = deliveryService
                    .getDeliveriesByEmployee(getCurrentUsername());
        } else {
            deliveries = deliveryService.getAllDeliveries();
        }

        return ResponseEntity.ok(deliveries);
    }

    // Lấy chi tiết giao hàng
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<DeliveryResponse> getDeliveryById(
            @PathVariable Integer id) {

        DeliveryResponse response;

        if (isEmployee()) {
            response = deliveryService.getDeliveryByIdForEmployee(
                    id,
                    getCurrentUsername()
            );
        } else {
            response = deliveryService.getDeliveryById(id);
        }

        return ResponseEntity.ok(response);
    }

    // Tạo thông tin giao hàng
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<DeliveryResponse> createDelivery(
            @RequestBody Delivery delivery) {

        DeliveryResponse response =
                deliveryService.createDelivery(delivery);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Phân công nhân viên giao hàng
    @PatchMapping("/{id}/assign")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<DeliveryResponse> assignEmployee(
            @PathVariable Integer id,
            @RequestBody Delivery delivery) {

        return ResponseEntity.ok(
                deliveryService.assignEmployee(
                        id,
                        delivery.getEmployeeId()
                )
        );
    }

    // Cập nhật trạng thái giao hàng
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<DeliveryResponse> updateDeliveryStatus(
            @PathVariable Integer id,
            @RequestBody Delivery delivery) {

        String username = getCurrentUsername();

        DeliveryResponse response;

        if (isEmployee()) {
            response = deliveryService.updateDeliveryStatusByEmployee(
                    id,
                    delivery.getDeliveryStatus(),
                    username
            );
        } else {
            response = deliveryService.updateDeliveryStatus(
                    id,
                    delivery.getDeliveryStatus()
            );
        }

        return ResponseEntity.ok(response);
    }

    // Cập nhật ghi chú giao hàng
    @PatchMapping("/{id}/note")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<DeliveryResponse> updateDeliveryNote(
            @PathVariable Integer id,
            @RequestBody Delivery delivery) {

        String username = getCurrentUsername();

        DeliveryResponse response;

        if (isEmployee()) {
            response = deliveryService.updateDeliveryNoteByEmployee(
                    id,
                    delivery.getDeliveryNote(),
                    username
            );
        } else {
            response = deliveryService.updateDeliveryNote(
                    id,
                    delivery.getDeliveryNote()
            );
        }

        return ResponseEntity.ok(response);
    }
}
