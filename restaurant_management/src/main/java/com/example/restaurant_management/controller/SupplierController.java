
package com.example.restaurant_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.restaurant_management.dto.Supplier;
import com.example.restaurant_management.dto.SupplierResponse;
import com.example.restaurant_management.service.SupplierService;

@RestController
@RequestMapping("/api/suppliers")
public class SupplierController {

    private final SupplierService supplierService;

    public SupplierController(SupplierService supplierService) {
        this.supplierService = supplierService;
    }

    // Lấy danh sách nhà cung cấp
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<SupplierResponse>> getAllSuppliers() {
        return ResponseEntity.ok(supplierService.getAllSuppliers());
    }

    // Lấy chi tiết nhà cung cấp
    @GetMapping("/{supplierId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<SupplierResponse> getSupplierById(
            @PathVariable Integer supplierId) {

        return ResponseEntity.ok(
                supplierService.getSupplierById(supplierId));
    }

    // Thêm nhà cung cấp
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<SupplierResponse> createSupplier(
            @RequestBody Supplier supplier) {

        SupplierResponse response =
                supplierService.createSupplier(supplier);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Cập nhật nhà cung cấp
    @PutMapping("/{supplierId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<SupplierResponse> updateSupplier(
            @PathVariable Integer supplierId,
            @RequestBody Supplier supplier) {

        return ResponseEntity.ok(
                supplierService.updateSupplier(supplierId, supplier));
    }

    // Kích hoạt nhà cung cấp
    @PatchMapping("/{supplierId}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<SupplierResponse> activateSupplier(
            @PathVariable Integer supplierId) {

        return ResponseEntity.ok(
                supplierService.updateActiveStatus(supplierId, true));
    }

    // Ngừng hoạt động nhà cung cấp
    @PatchMapping("/{supplierId}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<SupplierResponse> deactivateSupplier(
            @PathVariable Integer supplierId) {

        return ResponseEntity.ok(
                supplierService.updateActiveStatus(supplierId, false));
    }
}
