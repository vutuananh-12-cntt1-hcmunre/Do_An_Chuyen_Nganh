
package com.example.restaurant_management.service;

import java.math.BigDecimal;
import java.util.List;

import com.example.restaurant_management.dto.RecipeDetail;
import com.example.restaurant_management.dto.RecipeDetailResponse;

public interface RecipeDetailService {

    // Lấy danh sách nguyên liệu theo món ăn
    List<RecipeDetailResponse> getRecipeByDishId(Integer dishId);

    // Lấy chi tiết nguyên liệu trong công thức
    RecipeDetailResponse getRecipeDetailById(Integer recipeDetailId);

    // Thêm nguyên liệu vào công thức
    RecipeDetailResponse addIngredientToRecipe(RecipeDetail recipeDetail);

    // Cập nhật định lượng nguyên liệu
    RecipeDetailResponse updateRecipeDetail(
            Integer recipeDetailId,
            BigDecimal quantityRequired,
            String note
    );

    // Xóa nguyên liệu khỏi công thức
    void deleteRecipeDetail(Integer recipeDetailId);
}
