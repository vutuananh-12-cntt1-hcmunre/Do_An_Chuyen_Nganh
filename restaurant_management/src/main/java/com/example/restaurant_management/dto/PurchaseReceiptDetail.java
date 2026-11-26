
package com.example.restaurant_management.dto;

import java.math.BigDecimal;

public class PurchaseReceiptDetail {

    private Integer receiptDetailId;
    private Integer receiptId;
    private Integer ingredientId;
    private BigDecimal quantity;
    private BigDecimal unitPrice;
    private BigDecimal subtotal;

    public PurchaseReceiptDetail() {
    }

    public PurchaseReceiptDetail(
            Integer receiptDetailId,
            Integer receiptId,
            Integer ingredientId,
            BigDecimal quantity,
            BigDecimal unitPrice,
            BigDecimal subtotal) {

        this.receiptDetailId = receiptDetailId;
        this.receiptId = receiptId;
        this.ingredientId = ingredientId;
        this.quantity = quantity;
        this.unitPrice = unitPrice;
        this.subtotal = subtotal;
    }

    public Integer getReceiptDetailId() {
        return receiptDetailId;
    }

    public void setReceiptDetailId(Integer receiptDetailId) {
        this.receiptDetailId = receiptDetailId;
    }

    public Integer getReceiptId() {
        return receiptId;
    }

    public void setReceiptId(Integer receiptId) {
        this.receiptId = receiptId;
    }

    public Integer getIngredientId() {
        return ingredientId;
    }

    public void setIngredientId(Integer ingredientId) {
        this.ingredientId = ingredientId;
    }

    public BigDecimal getQuantity() {
        return quantity;
    }

    public void setQuantity(BigDecimal quantity) {
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
}
