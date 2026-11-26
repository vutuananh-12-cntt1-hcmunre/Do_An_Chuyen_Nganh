package com.example.restaurant_management.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

public class OrderResponse {
    private Integer orderId;
    private String orderCode;
    private Integer userId;
    private String username;
    private Integer tableId;
    private String tableCode;
    private String orderType;
    private String orderStatus;
    private String deliveryAddress;
    private String customerNote;
    private BigDecimal subtotal;
    private BigDecimal discountAmount;
    private BigDecimal deliveryFee;
    private BigDecimal totalAmount;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private List<OrderItemResponse> items;
    public OrderResponse() {
    }

    public OrderResponse(
            Integer orderId,
            String orderCode,
            Integer userId,
            String username,
            Integer tableId,
            String tableCode,
            String orderType,
            String orderStatus,
            String deliveryAddress,
            String customerNote,
            BigDecimal subtotal,
            BigDecimal discountAmount,
            BigDecimal deliveryFee,
            BigDecimal totalAmount,
            LocalDateTime createdAt,
            LocalDateTime updatedAt,
            List<OrderItemResponse> items) {

        this.orderId = orderId;
        this.orderCode = orderCode;
        this.userId = userId;
        this.username = username;
        this.tableId = tableId;
        this.tableCode = tableCode;
        this.orderType = orderType;
        this.orderStatus = orderStatus;
        this.deliveryAddress = deliveryAddress;
        this.customerNote = customerNote;
        this.subtotal = subtotal;
        this.discountAmount = discountAmount;
        this.deliveryFee = deliveryFee;
        this.totalAmount = totalAmount;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
        this.items = items;
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

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public Integer getTableId() {
        return tableId;
    }

    public void setTableId(Integer tableId) {
        this.tableId = tableId;
    }

    public String getTableCode() {
        return tableCode;
    }

    public void setTableCode(String tableCode) {
        this.tableCode = tableCode;
    }

    public String getOrderType() {
        return orderType;
    }

    public void setOrderType(String orderType) {
        this.orderType = orderType;
    }

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public String getDeliveryAddress() {
        return deliveryAddress;
    }

    public void setDeliveryAddress(String deliveryAddress) {
        this.deliveryAddress = deliveryAddress;
    }

    public String getCustomerNote() {
        return customerNote;
    }

    public void setCustomerNote(String customerNote) {
        this.customerNote = customerNote;
    }

    public BigDecimal getSubtotal() {
        return subtotal;
    }

    public void setSubtotal(BigDecimal subtotal) {
        this.subtotal = subtotal;
    }

    public BigDecimal getDiscountAmount() {
        return discountAmount;
    }

    public void setDiscountAmount(BigDecimal discountAmount) {
        this.discountAmount = discountAmount;
    }

    public BigDecimal getDeliveryFee() {
        return deliveryFee;
    }

    public void setDeliveryFee(BigDecimal deliveryFee) {
        this.deliveryFee = deliveryFee;
    }

    public BigDecimal getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(BigDecimal totalAmount) {
        this.totalAmount = totalAmount;
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

    public List<OrderItemResponse> getItems() {
        return items;
    }

    public void setItems(List<OrderItemResponse> items) {
        this.items = items;
    }

    // DTO phản hồi chi tiết từng món ăn
    public static class OrderItemResponse {

        private Integer orderItemId;
        private Integer dishId;
        private String dishName;
        private Integer quantity;
        private BigDecimal unitPrice;
        private BigDecimal subtotal;
        private String itemNote;
        private String itemStatus;
        private LocalDateTime sentToKitchenAt;
        private LocalDateTime completedAt;

        public OrderItemResponse() {
        }

        public OrderItemResponse(
                Integer orderItemId,
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
}
