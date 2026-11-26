
package com.example.restaurant_management.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public class IngredientResponse {

    private Integer ingredientId;
    private String ingredientCode;
    private String ingredientName;
    private String unit;
    private BigDecimal stockQuantity;
    private BigDecimal minStockQuantity;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public IngredientResponse() {
    }

    public IngredientResponse(Integer ingredientId, String ingredientCode,
            String ingredientName, String unit,
            BigDecimal stockQuantity, BigDecimal minStockQuantity,
            Boolean isActive, LocalDateTime createdAt,
            LocalDateTime updatedAt) {

        this.ingredientId = ingredientId;
        this.ingredientCode = ingredientCode;
        this.ingredientName = ingredientName;
        this.unit = unit;
        this.stockQuantity = stockQuantity;
        this.minStockQuantity = minStockQuantity;
        this.isActive = isActive;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Integer getIngredientId() {
        return ingredientId;
    }

    public void setIngredientId(Integer ingredientId) {
        this.ingredientId = ingredientId;
    }

    public String getIngredientCode() {
        return ingredientCode;
    }

    public void setIngredientCode(String ingredientCode) {
        this.ingredientCode = ingredientCode;
    }

    public String getIngredientName() {
        return ingredientName;
    }

    public void setIngredientName(String ingredientName) {
        this.ingredientName = ingredientName;
    }

    public String getUnit() {
        return unit;
    }

    public void setUnit(String unit) {
        this.unit = unit;
    }

    public BigDecimal getStockQuantity() {
        return stockQuantity;
    }

    public void setStockQuantity(BigDecimal stockQuantity) {
        this.stockQuantity = stockQuantity;
    }

    public BigDecimal getMinStockQuantity() {
        return minStockQuantity;
    }

    public void setMinStockQuantity(BigDecimal minStockQuantity) {
        this.minStockQuantity = minStockQuantity;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
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
