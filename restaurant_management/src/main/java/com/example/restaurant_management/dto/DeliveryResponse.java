
package com.example.restaurant_management.dto;

import java.time.LocalDateTime;

public class DeliveryResponse {

    private Integer deliveryId;
    private Integer orderId;
    private String orderCode;
    private String deliveryAddress;

    private Integer employeeId;
    private String employeeName;

    private String deliveryStatus;
    private LocalDateTime assignedAt;
    private LocalDateTime pickedUpAt;
    private LocalDateTime deliveredAt;
    private String deliveryNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public DeliveryResponse() {
    }

    public DeliveryResponse(
            Integer deliveryId,
            Integer orderId,
            String orderCode,
            String deliveryAddress,
            Integer employeeId,
            String employeeName,
            String deliveryStatus,
            LocalDateTime assignedAt,
            LocalDateTime pickedUpAt,
            LocalDateTime deliveredAt,
            String deliveryNote,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {

        this.deliveryId = deliveryId;
        this.orderId = orderId;
        this.orderCode = orderCode;
        this.deliveryAddress = deliveryAddress;
        this.employeeId = employeeId;
        this.employeeName = employeeName;
        this.deliveryStatus = deliveryStatus;
        this.assignedAt = assignedAt;
        this.pickedUpAt = pickedUpAt;
        this.deliveredAt = deliveredAt;
        this.deliveryNote = deliveryNote;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    // Constructor cũ để tương thích nếu nơi khác đang sử dụng
    public DeliveryResponse(
            Integer deliveryId,
            Integer orderId,
            String orderCode,
            Integer employeeId,
            String employeeName,
            String deliveryStatus,
            LocalDateTime assignedAt,
            LocalDateTime pickedUpAt,
            LocalDateTime deliveredAt,
            String deliveryNote,
            LocalDateTime createdAt,
            LocalDateTime updatedAt) {

        this(
                deliveryId,
                orderId,
                orderCode,
                null,
                employeeId,
                employeeName,
                deliveryStatus,
                assignedAt,
                pickedUpAt,
                deliveredAt,
                deliveryNote,
                createdAt,
                updatedAt
        );
    }

    public Integer getDeliveryId() {
        return deliveryId;
    }

    public void setDeliveryId(Integer deliveryId) {
        this.deliveryId = deliveryId;
    }

    public Integer getOrderId() {
        return orderId;
    }

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }

    public String getOrderCode() {
        return orderCode;
    }

    public void setOrderCode(String orderCode) {
        this.orderCode = orderCode;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public Integer getEmployeeId() {
        return employeeId;
    }

    public void setEmployeeId(Integer employeeId) {
        this.employeeId = employeeId;
    }

    public String getEmployeeName() {
        return employeeName;
    }

    public void setEmployeeName(String employeeName) {
        this.employeeName = employeeName;
    }

    public String getDeliveryStatus() {
        return deliveryStatus;
    }

    public void setDeliveryStatus(String deliveryStatus) {
        this.deliveryStatus = deliveryStatus;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }

    public LocalDateTime getPickedUpAt() {
        return pickedUpAt;
    }

    public void setPickedUpAt(LocalDateTime pickedUpAt) {
        this.pickedUpAt = pickedUpAt;
    }

    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }

    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }

    public String getDeliveryNote() {
        return deliveryNote;
    }

    public void setDeliveryNote(String deliveryNote) {
        this.deliveryNote = deliveryNote;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
