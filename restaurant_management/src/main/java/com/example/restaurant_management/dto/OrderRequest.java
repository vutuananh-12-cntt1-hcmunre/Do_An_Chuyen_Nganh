
package com.example.restaurant_management.dto;

import java.util.List;

import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

public class OrderRequest {

    @NotBlank(message = "Loại đơn hàng không được để trống")
    @Pattern(
        regexp = "DELIVERY|DINE_IN",
        message = "Loại đơn hàng không hợp lệ"
    )
    private String orderType;

    @Positive(message = "ID bàn phải lớn hơn 0")
    private Integer tableId;

    @Size(max = 500, message = "Địa chỉ giao hàng tối đa 500 ký tự")
    private String deliveryAddress;

    @Size(max = 500, message = "Ghi chú tối đa 500 ký tự")
    private String customerNote;

    @Size(max = 50, message = "Mã khuyến mãi tối đa 50 ký tự")
    private String promotionCode;

    @NotEmpty(message = "Đơn hàng phải có ít nhất một món ăn")
    @Valid
    private List<OrderItemRequest> items;

    public OrderRequest() {
    }

    // Giữ constructor cũ
    public OrderRequest(
            String orderType,
            Integer tableId,
            String deliveryAddress,
            String customerNote,
            List<OrderItemRequest> items) {

        this(
            orderType,
            tableId,
            deliveryAddress,
            customerNote,
            null,
            items
        );
    }

    public OrderRequest(
            String orderType,
            Integer tableId,
            String deliveryAddress,
            String customerNote,
            String promotionCode,
            List<OrderItemRequest> items) {

        this.orderType = orderType;
        this.tableId = tableId;
        this.deliveryAddress = deliveryAddress;
        this.customerNote = customerNote;
        this.promotionCode = promotionCode;
        this.items = items;
    }

    public String getOrderType() {
        return orderType;
    }

    public void setOrderType(String orderType) {
        this.orderType = orderType;
    }

    public Integer getTableId() {
        return tableId;
    }

    public void setTableId(Integer tableId) {
        this.tableId = tableId;
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

    public String getPromotionCode() {
        return promotionCode;
    }

    public void setPromotionCode(String promotionCode) {
        this.promotionCode = promotionCode;
    }

    public List<OrderItemRequest> getItems() {
        return items;
    }

    public void setItems(List<OrderItemRequest> items) {
        this.items = items;
    }

    public static class OrderItemRequest {

        @NotNull(message = "Mã món ăn không được để trống")
        @Positive(message = "Mã món ăn phải lớn hơn 0")
        private Integer dishId;

        @NotNull(message = "Số lượng không được để trống")
        @Positive(message = "Số lượng phải lớn hơn 0")
        private Integer quantity;

        @Size(max = 500, message = "Ghi chú món ăn tối đa 500 ký tự")
        private String itemNote;

        public OrderItemRequest() {
        }

        public OrderItemRequest(
                Integer dishId,
                Integer quantity,
                String itemNote) {

            this.dishId = dishId;
            this.quantity = quantity;
            this.itemNote = itemNote;
        }

        public Integer getDishId() {
            return dishId;
        }

        public void setDishId(Integer dishId) {
            this.dishId = dishId;
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
    }
}
