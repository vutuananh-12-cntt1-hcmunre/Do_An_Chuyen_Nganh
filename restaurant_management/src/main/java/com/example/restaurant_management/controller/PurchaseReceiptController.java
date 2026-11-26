
package com.example.restaurant_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.restaurant_management.dto.PurchaseReceipt;
import com.example.restaurant_management.dto.PurchaseReceiptDetail;
import com.example.restaurant_management.dto.PurchaseReceiptDetailResponse;
import com.example.restaurant_management.dto.PurchaseReceiptResponse;
import com.example.restaurant_management.service.PurchaseReceiptService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/purchase-receipts")
public class PurchaseReceiptController {

    private final PurchaseReceiptService receiptService;

    public PurchaseReceiptController(
            PurchaseReceiptService receiptService) {
        this.receiptService = receiptService;
    }

    // Lấy danh sách phiếu nhập
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<PurchaseReceiptResponse>> getAllReceipts() {
        return ResponseEntity.ok(receiptService.getAllReceipts());
    }

    // Lấy phiếu nhập theo ID
    @GetMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<PurchaseReceiptResponse> getReceiptById(
            @PathVariable Integer id) {
        return ResponseEntity.ok(receiptService.getReceiptById(id));
    }

    // Tạo phiếu nhập
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PurchaseReceiptResponse> createReceipt(
            @Valid @RequestBody PurchaseReceipt receipt) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(receiptService.createReceipt(receipt));
    }

    // Cập nhật phiếu nhập
    @PutMapping("/{id}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PurchaseReceiptResponse> updateReceipt(
            @PathVariable Integer id,
            @Valid @RequestBody PurchaseReceipt receipt) {

        return ResponseEntity.ok(
                receiptService.updateReceipt(id, receipt)
        );
    }

    // Xác nhận phiếu nhập và cộng tồn kho
    @PatchMapping("/{id}/confirm")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PurchaseReceiptResponse> confirmReceipt(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                receiptService.confirmReceipt(id)
        );
    }

    // Hủy phiếu nhập
    @PatchMapping("/{id}/cancel")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> cancelReceipt(
            @PathVariable Integer id) {

        receiptService.cancelReceipt(id);
        return ResponseEntity.noContent().build();
    }

    // Lấy danh sách nguyên liệu trong phiếu
    @GetMapping("/{id}/details")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<PurchaseReceiptDetailResponse>> getReceiptDetails(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
                receiptService.getReceiptDetails(id)
        );
    }

    // Thêm nguyên liệu vào phiếu
    @PostMapping("/{id}/details")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PurchaseReceiptDetailResponse> addReceiptDetail(
            @PathVariable Integer id,
            @Valid @RequestBody PurchaseReceiptDetail detail) {

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(receiptService.addReceiptDetail(id, detail));
    }

    // Cập nhật chi tiết phiếu nhập
    @PutMapping("/details/{detailId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<PurchaseReceiptDetailResponse> updateReceiptDetail(
            @PathVariable Integer detailId,
            @Valid @RequestBody PurchaseReceiptDetail detail) {

        return ResponseEntity.ok(
                receiptService.updateReceiptDetail(detailId, detail)
        );
    }

    // Xóa chi tiết phiếu nhập
    @DeleteMapping("/details/{detailId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteReceiptDetail(
            @PathVariable Integer detailId) {

        receiptService.deleteReceiptDetail(detailId);
        return ResponseEntity.noContent().build();
    }
}
