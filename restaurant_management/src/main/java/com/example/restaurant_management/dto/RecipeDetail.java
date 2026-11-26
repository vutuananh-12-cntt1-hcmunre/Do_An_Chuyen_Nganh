
package com.example.restaurant_management.dto;

import java.math.BigDecimal;

public class RecipeDetail {

    private Integer recipeDetailId;
    private Integer dishId;
    private Integer ingredientId;
    private BigDecimal quantityRequired;
    private String note;

    public RecipeDetail() {
    }

    public RecipeDetail(
            Integer recipeDetailId,
            Integer dishId,
            Integer ingredientId,
            BigDecimal quantityRequired,
            String note) {
        this.recipeDetailId = recipeDetailId;
        this.dishId = dishId;
        this.ingredientId = ingredientId;
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

    public Integer getIngredientId() {
        return ingredientId;
    }

    public void setIngredientId(Integer ingredientId) {
        this.ingredientId = ingredientId;
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
