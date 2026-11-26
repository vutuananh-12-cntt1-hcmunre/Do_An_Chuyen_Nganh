
package com.example.restaurant_management.dto;

import java.time.LocalDateTime;
import java.util.List;

public class KitchenOrderResponse {

    private Integer orderId;
    private String orderCode;
    private String orderType;
    private String tableCode;
    private String orderStatus;
    private LocalDateTime createdAt;

    private List<KitchenOrderItemResponse> items;

    public KitchenOrderResponse() {
    }

    public KitchenOrderResponse(
            Integer orderId,
            String orderCode,
            String orderType,
            String tableCode,
            String orderStatus,
            LocalDateTime createdAt,
            List<KitchenOrderItemResponse> items
    ) {
        this.orderId = orderId;
        this.orderCode = orderCode;
        this.orderType = orderType;
        this.tableCode = tableCode;
        this.orderStatus = orderStatus;
        this.createdAt = createdAt;
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

    public String getOrderStatus() {
        return orderStatus;
    }

    public void setOrderStatus(String orderStatus) {
        this.orderStatus = orderStatus;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public List<KitchenOrderItemResponse> getItems() {
        return items;
    }

    public void setItems(List<KitchenOrderItemResponse> items) {
        this.items = items;
    }
}
