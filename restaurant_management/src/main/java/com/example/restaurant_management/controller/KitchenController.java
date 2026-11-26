
package com.example.restaurant_management.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.restaurant_management.dto.KitchenOrderItemResponse;
import com.example.restaurant_management.service.KitchenService;

@RestController
@RequestMapping("/api/kitchen")
public class KitchenController {

    private final KitchenService kitchenService;

    public KitchenController(KitchenService kitchenService) {
        this.kitchenService = kitchenService;
    }

    // Lấy danh sách món cần chế biến
    @GetMapping("/items")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<KitchenOrderItemResponse>> getKitchenItems() {

        return ResponseEntity.ok(
                kitchenService.getKitchenItems()
        );
    }

    // Bắt đầu chế biến món ăn
    @PatchMapping("/items/{orderItemId}/preparing")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<String> startPreparing(
            @PathVariable Integer orderItemId
    ) {

        kitchenService.startPreparing(orderItemId);

        return ResponseEntity.ok(
                "Đã chuyển món ăn sang đang chế biến"
        );
    }

    // Hoàn thành món ăn
    @PatchMapping("/items/{orderItemId}/complete")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<String> completeItem(
            @PathVariable Integer orderItemId
    ) {

        kitchenService.completeItem(orderItemId);

        return ResponseEntity.ok(
                "Đã hoàn thành chế biến món ăn"
        );
    }
    // Lấy lịch sử món đã hoàn thành
@GetMapping("/items/completed")
@PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
public ResponseEntity<List<KitchenOrderItemResponse>> getCompletedKitchenItems() {

    return ResponseEntity.ok(
        kitchenService.getCompletedKitchenItems()
    );
}
}
