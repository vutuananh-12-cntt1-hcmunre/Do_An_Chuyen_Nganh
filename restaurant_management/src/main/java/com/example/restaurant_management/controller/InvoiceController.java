
package com.example.restaurant_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.restaurant_management.dto.InvoiceResponse;
import com.example.restaurant_management.service.InvoiceService;

@RestController
@RequestMapping("/api/invoices")
public class InvoiceController {

    private final InvoiceService invoiceService;

    public InvoiceController(InvoiceService invoiceService) {
        this.invoiceService = invoiceService;
    }

    // Lấy danh sách tất cả hóa đơn
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<InvoiceResponse>> getAllInvoices() {

        return ResponseEntity.ok(
                invoiceService.getAllInvoices()
        );
    }

    // Lấy hóa đơn theo ID
    @GetMapping("/{invoiceId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<InvoiceResponse> getInvoiceById(
            @PathVariable Integer invoiceId
    ) {

        return ResponseEntity.ok(
                invoiceService.getInvoiceById(invoiceId)
        );
    }

    // Lấy hóa đơn theo đơn hàng
    @GetMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE', 'CUSTOMER')")
    public ResponseEntity<InvoiceResponse> getInvoiceByOrderId(
            @PathVariable Integer orderId
    ) {

        return ResponseEntity.ok(
                invoiceService.getInvoiceByOrderId(orderId)
        );
    }

    // Tạo hóa đơn từ đơn hàng đã thanh toán
    @PostMapping("/order/{orderId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<InvoiceResponse> createInvoice(
            @PathVariable Integer orderId
    ) {

        InvoiceResponse response =
                invoiceService.createInvoice(orderId);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }
}
