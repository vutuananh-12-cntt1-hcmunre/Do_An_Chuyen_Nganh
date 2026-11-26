
package com.example.restaurant_management.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class PurchaseReceiptResponse {

    private Integer receiptId;
    private String receiptCode;
    private Integer supplierId;
    private String supplierName;
    private Integer employeeId;
    private String receiptStatus;
    private BigDecimal totalAmount;
    private String note;
    private LocalDateTime createdAt;
    private LocalDateTime confirmedAt;

    public PurchaseReceiptResponse() {
    }

    public PurchaseReceiptResponse(
            Integer receiptId,
            String receiptCode,
            Integer supplierId,
            String supplierName,
            Integer employeeId,
            String receiptStatus,
            BigDecimal totalAmount,
            String note,
            LocalDateTime createdAt,
            LocalDateTime confirmedAt) {

        this.receiptId = receiptId;
        this.receiptCode = receiptCode;
        this.supplierId = supplierId;
        this.supplierName = supplierName;
        this.employeeId = employeeId;
        this.receiptStatus = receiptStatus;
        this.totalAmount = totalAmount;
        this.note = note;
        this.createdAt = createdAt;
        this.confirmedAt = confirmedAt;
    }

    public Integer getReceiptId() {
        return receiptId;
    }

    public void setReceiptId(Integer receiptId) {
        this.receiptId = receiptId;
    }

    public String getReceiptCode() {
        return receiptCode;
    }

    public void setReceiptCode(String receiptCode) {
        this.receiptCode = receiptCode;
    }

    public Integer getSupplierId() {
        return supplierId;
    }

    public void setSupplierId(Integer supplierId) {
        this.supplierId = supplierId;
    }

    public String getSupplierName() {
        return supplierName;
    }

    public void setSupplierName(String supplierName) {
        this.supplierName = supplierName;
    }

    public Integer getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Integer employeeId) {
        this.employeeId = employeeId;
    }

    public String getReceiptStatus() {
        return receiptStatus;
    }

    public void setReceiptStatus(String receiptStatus) {
        this.receiptStatus = receiptStatus;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getConfirmedAt() {
        return confirmedAt;
    }

    public void setConfirmedAt(LocalDateTime confirmedAt) {
        this.confirmedAt = confirmedAt;
    }
}
