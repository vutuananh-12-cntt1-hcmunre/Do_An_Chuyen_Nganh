
package com.example.restaurant_management.service;

import java.util.List;

import com.example.restaurant_management.dto.Ingredient;
import com.example.restaurant_management.dto.IngredientResponse;

public interface IngredientService {

    // Lấy danh sách nguyên liệu
    List<IngredientResponse> getAllIngredients();

    // Lấy nguyên liệu theo ID
    IngredientResponse getIngredientById(Integer ingredientId);

    // Thêm nguyên liệu
    IngredientResponse createIngredient(Ingredient ingredient);

    // Cập nhật nguyên liệu
    IngredientResponse updateIngredient(Integer ingredientId, Ingredient ingredient);

    // Kích hoạt / ngừng hoạt động nguyên liệu
    IngredientResponse updateActiveStatus(Integer ingredientId, Boolean isActive);
}
