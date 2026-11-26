
package com.example.restaurant_management.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;

public class PaymentRequest {

    @NotNull(message = "Mã đơn hàng không được để trống")
    @Positive(message = "Mã đơn hàng phải lớn hơn 0")
    private Integer orderId;

    @NotBlank(message = "Phương thức thanh toán không được để trống")
    @Pattern(
        regexp = "CASH|BANK_TRANSFER|ONLINE",
        message = "Phương thức thanh toán không hợp lệ"
    )
    private String paymentMethod;

    private String transactionCode;

    public PaymentRequest() {
    }

    public PaymentRequest(
            Integer orderId,
            String paymentMethod,
            String transactionCode
    ) {
        this.orderId = orderId;
        this.paymentMethod = paymentMethod;
        this.transactionCode = transactionCode;
    }

    public Integer getOrderId() {
        return orderId;
    }

    public void setOrderId(Integer orderId) {
        this.orderId = orderId;
    }

    public String getPaymentMethod() {
        return paymentMethod;
    }

    public void setPaymentMethod(String paymentMethod) {
        this.paymentMethod = paymentMethod;
    }

    public String getTransactionCode() {
        return transactionCode;
    }

    public void setTransactionCode(String transactionCode) {
        this.transactionCode = transactionCode;
    }
}
