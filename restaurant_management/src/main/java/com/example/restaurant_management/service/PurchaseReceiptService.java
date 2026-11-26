
package com.example.restaurant_management.service;

import java.util.List;

import com.example.restaurant_management.dto.PurchaseReceipt;
import com.example.restaurant_management.dto.PurchaseReceiptDetail;
import com.example.restaurant_management.dto.PurchaseReceiptDetailResponse;
import com.example.restaurant_management.dto.PurchaseReceiptResponse;

public interface PurchaseReceiptService {

    // Lấy danh sách phiếu nhập
    List<PurchaseReceiptResponse> getAllReceipts();

    // Lấy phiếu nhập theo ID
    PurchaseReceiptResponse getReceiptById(Integer receiptId);

    // Tạo phiếu nhập
    PurchaseReceiptResponse createReceipt(PurchaseReceipt receipt);

    // Cập nhật thông tin phiếu nhập
    PurchaseReceiptResponse updateReceipt(
            Integer receiptId,
            PurchaseReceipt receipt
    );

    // Xác nhận phiếu nhập và cộng tồn kho
    PurchaseReceiptResponse confirmReceipt(Integer receiptId);

    // Hủy phiếu nhập
    void cancelReceipt(Integer receiptId);

    // Lấy danh sách chi tiết phiếu nhập
    List<PurchaseReceiptDetailResponse> getReceiptDetails(
            Integer receiptId
    );

    // Thêm nguyên liệu vào phiếu nhập
    PurchaseReceiptDetailResponse addReceiptDetail(
            Integer receiptId,
            PurchaseReceiptDetail detail
    );

    // Cập nhật chi tiết phiếu nhập
    PurchaseReceiptDetailResponse updateReceiptDetail(
            Integer receiptDetailId,
            PurchaseReceiptDetail detail
    );

    // Xóa chi tiết phiếu nhập
    void deleteReceiptDetail(Integer receiptDetailId);
}
