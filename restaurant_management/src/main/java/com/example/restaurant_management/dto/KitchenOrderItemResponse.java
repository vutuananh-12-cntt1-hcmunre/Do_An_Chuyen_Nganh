
package com.example.restaurant_management.dto;

import java.time.LocalDateTime;

public class KitchenOrderItemResponse {

    private Integer orderItemId;
    private Integer orderId;
    private String orderCode;
    private String orderType;
    private String tableCode;

    private String dishName;
    private Integer quantity;
    private String itemNote;
    private String itemStatus;

    private LocalDateTime sentToKitchenAt;
    private LocalDateTime completedAt;

    public KitchenOrderItemResponse() {
    }

    public KitchenOrderItemResponse(
            Integer orderItemId,
            Integer orderId,
            String orderCode,
            String orderType,
            String tableCode,
            String dishName,
            Integer quantity,
            String itemNote,
            String itemStatus,
            LocalDateTime sentToKitchenAt,
            LocalDateTime completedAt
    ) {
        this.orderItemId = orderItemId;
        this.orderId = orderId;
        this.orderCode = orderCode;
        this.orderType = orderType;
        this.tableCode = tableCode;
        this.dishName = dishName;
        this.quantity = quantity;
        this.itemNote = itemNote;
        this.itemStatus = itemStatus;
        this.sentToKitchenAt = sentToKitchenAt;
        this.completedAt = completedAt;
    }

    // Getters và Setters

    public Integer getOrderItemId() {
        return orderItemId;
    }

    public void setOrderItemId(Integer orderItemId) {
        this.orderItemId = orderItemId;
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

    public String getOrderType() {
        return orderType;
    }

    public void setOrderType(String orderType) {
        this.orderType = orderType;
    }

    public String getTableCode() {
        return tableCode;
    }

    public void setTableCode(String tableCode) {
        this.tableCode = tableCode;
    }

    public String getDishName() {
        return dishName;
    }

    public void setDishName(String dishName) {
        this.dishName = dishName;
    }

    public Integer getQuantity() {
        return quantity;
    }

    public void setQuantity(Integer quantity) {
        this.quantity = quantity;
    }

    public String getItemNote() {
        return itemNote;
    }

    public void setItemNote(String itemNote) {
        this.itemNote = itemNote;
    }

    public String getItemStatus() {
        return itemStatus;
    }

    public void setItemStatus(String itemStatus) {
        this.itemStatus = itemStatus;
    }

    public LocalDateTime getSentToKitchenAt() {
        return sentToKitchenAt;
    }

    public void setSentToKitchenAt(LocalDateTime sentToKitchenAt) {
        this.sentToKitchenAt = sentToKitchenAt;
    }

    public LocalDateTime getCompletedAt() {
        return completedAt;
    }

    public void setCompletedAt(LocalDateTime completedAt) {
        this.completedAt = completedAt;
    }
}
