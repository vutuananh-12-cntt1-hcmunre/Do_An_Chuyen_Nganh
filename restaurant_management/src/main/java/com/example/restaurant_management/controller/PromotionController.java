
package com.example.restaurant_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.restaurant_management.dto.Promotion;
import com.example.restaurant_management.dto.PromotionResponse;
import com.example.restaurant_management.service.PromotionService;

@RestController
@RequestMapping("/api/promotions")
@CrossOrigin("*")
public class PromotionController {

    private final PromotionService promotionService;

    public PromotionController(PromotionService promotionService) {
        this.promotionService = promotionService;
    }

    // Lấy danh sách tất cả khuyến mãi dành cho quản lý
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<PromotionResponse>> getAllPromotions() {
        return ResponseEntity.ok(
                promotionService.getAllPromotions()
        );
    }

    // Lấy danh sách khuyến mãi đang có hiệu lực cho khách hàng
    @GetMapping("/available")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<List<PromotionResponse>> getAvailablePromotions() {
        return ResponseEntity.ok(
                promotionService.getAvailablePromotions()
        );
    }

    // Lấy chi tiết khuyến mãi
    @GetMapping("/{promotionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<PromotionResponse> getPromotionById(
            @PathVariable Integer promotionId) {

        return ResponseEntity.ok(
                promotionService.getPromotionById(promotionId)
        );
    }

    // Tạo khuyến mãi
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PromotionResponse> createPromotion(
            @RequestBody Promotion promotion) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(promotionService.createPromotion(promotion));
    }

    // Cập nhật khuyến mãi
    @PutMapping("/{promotionId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PromotionResponse> updatePromotion(
            @PathVariable Integer promotionId,
            @RequestBody Promotion promotion) {

        return ResponseEntity.ok(
                promotionService.updatePromotion(promotionId, promotion)
        );
    }

    // Kích hoạt khuyến mãi
    @PatchMapping("/{promotionId}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PromotionResponse> activatePromotion(
            @PathVariable Integer promotionId) {

        return ResponseEntity.ok(
                promotionService.updateActiveStatus(promotionId, true)
        );
    }

    // Ngừng kích hoạt khuyến mãi
    @PatchMapping("/{promotionId}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PromotionResponse> deactivatePromotion(
            @PathVariable Integer promotionId) {

        return ResponseEntity.ok(
                promotionService.updateActiveStatus(promotionId, false)
        );
    }
}
