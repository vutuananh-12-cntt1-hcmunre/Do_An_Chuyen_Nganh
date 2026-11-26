
package com.example.restaurant_management.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class OrderItem {

    private Integer orderItemId;
    private Integer orderId;
    private Integer dishId;

    private String dishName;

    private Integer quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;

    private String itemNote;
    private String itemStatus;

    private LocalDateTime sentToKitchenAt;
    private LocalDateTime completedAt;

    public OrderItem() {
    }

    public OrderItem(
            Integer orderItemId,
            Integer orderId,
            Integer dishId,
            String dishName,
            Integer quantity,
            BigDecimal unitPrice,
            BigDecimal subtotal,
            String itemNote,
            String itemStatus,
            LocalDateTime sentToKitchenAt,
            LocalDateTime completedAt) {

        this.orderItemId = orderItemId;
        this.orderId = orderId;
        this.dishId = dishId;
        this.dishName = dishName;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = subtotal;
        this.itemNote = itemNote;
        this.itemStatus = itemStatus;
        this.sentToKitchenAt = sentToKitchenAt;
        this.completedAt = completedAt;
    }

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

    public Integer getDishId() {
        return dishId;
    }

    public void setDishId(Integer dishId) {
        this.dishId = dishId;
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

    public BigDecimal getUnitPrice() {
        return unitPrice;
    }

    public void setUnitPrice(BigDecimal unitPrice) {
        this.unitPrice = unitPrice;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
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
