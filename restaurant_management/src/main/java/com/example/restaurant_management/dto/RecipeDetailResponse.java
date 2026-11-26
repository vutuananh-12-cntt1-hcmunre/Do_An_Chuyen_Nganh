
package com.example.restaurant_management.dto;

import java.math.BigDecimal;

public class RecipeDetailResponse {

    private Integer recipeDetailId;
    private Integer dishId;
    private String dishName;
    private Integer ingredientId;
    private String ingredientName;
    private String unit;
    private BigDecimal quantityRequired;
    private String note;

    public RecipeDetailResponse() {
    }

    public RecipeDetailResponse(
            Integer recipeDetailId,
            Integer dishId,
            String dishName,
            Integer ingredientId,
            String ingredientName,
            String unit,
            BigDecimal quantityRequired,
            String note) {
        this.recipeDetailId = recipeDetailId;
        this.dishId = dishId;
        this.dishName = dishName;
        this.ingredientId = ingredientId;
        this.ingredientName = ingredientName;
        this.unit = unit;
        this.quantityRequired = quantityRequired;
        this.note = note;
    }

    public Integer getRecipeDetailId() {
        return recipeDetailId;
    }

    public void setRecipeDetailId(Integer recipeDetailId) {
        this.recipeDetailId = recipeDetailId;
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

    public Integer getIngredientId() {
        return ingredientId;
    }

    public void setIngredientId(Integer ingredientId) {
        this.ingredientId = ingredientId;
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

    public BigDecimal getQuantityRequired() {
        return quantityRequired;
    }

    public void setQuantityRequired(BigDecimal quantityRequired) {
        this.quantityRequired = quantityRequired;
    }

    public String getNote() {
        return note;
    }

    public void setNote(String note) {
        this.note = note;
    }
}
