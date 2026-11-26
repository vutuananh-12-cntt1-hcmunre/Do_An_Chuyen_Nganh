package com.example.restaurant_management.service;

import java.util.List;

import com.example.restaurant_management.dto.InvoiceResponse;

public interface InvoiceService {

    // Lấy danh sách hóa đơn
    List<InvoiceResponse> getAllInvoices();

    // Lấy hóa đơn theo ID
    InvoiceResponse getInvoiceById(Integer invoiceId);

    // Lấy hóa đơn theo ID đơn hàng
    InvoiceResponse getInvoiceByOrderId(Integer orderId);

    // Tạo hóa đơn từ đơn hàng
    InvoiceResponse createInvoice(Integer orderId);
}