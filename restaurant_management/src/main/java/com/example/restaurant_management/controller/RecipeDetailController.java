
package com.example.restaurant_management.controller;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.restaurant_management.dto.RecipeDetail;
import com.example.restaurant_management.dto.RecipeDetailResponse;
import com.example.restaurant_management.service.RecipeDetailService;

@RestController
@RequestMapping("/api/recipes")
@CrossOrigin("*")
public class RecipeDetailController {

    private final RecipeDetailService recipeDetailService;

    public RecipeDetailController(
            RecipeDetailService recipeDetailService) {
        this.recipeDetailService = recipeDetailService;
    }

    // Lấy công thức của một món ăn
    @GetMapping("/dish/{dishId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<RecipeDetailResponse>> getRecipeByDishId(
            @PathVariable Integer dishId) {

        return ResponseEntity.ok(
                recipeDetailService.getRecipeByDishId(dishId)
        );
    }

    // Lấy chi tiết một nguyên liệu trong công thức
    @GetMapping("/{recipeDetailId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<RecipeDetailResponse> getRecipeDetailById(
            @PathVariable Integer recipeDetailId) {

        return ResponseEntity.ok(
                recipeDetailService.getRecipeDetailById(recipeDetailId)
        );
    }

    // Thêm nguyên liệu vào công thức
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<RecipeDetailResponse> addIngredientToRecipe(
            @RequestBody RecipeDetail recipeDetail) {

        RecipeDetailResponse response =
                recipeDetailService.addIngredientToRecipe(recipeDetail);

        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }

    // Cập nhật định lượng nguyên liệu
    @PutMapping("/{recipeDetailId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<RecipeDetailResponse> updateRecipeDetail(
            @PathVariable Integer recipeDetailId,
            @RequestBody UpdateRecipeDetailRequest request) {

        RecipeDetailResponse response =
                recipeDetailService.updateRecipeDetail(
                        recipeDetailId,
                        request.getQuantityRequired(),
                        request.getNote()
                );

        return ResponseEntity.ok(response);
    }

    // Xóa nguyên liệu khỏi công thức
    @DeleteMapping("/{recipeDetailId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> deleteRecipeDetail(
            @PathVariable Integer recipeDetailId) {

        recipeDetailService.deleteRecipeDetail(recipeDetailId);

        return ResponseEntity.noContent().build();
    }

    // DTO nhận dữ liệu cập nhật
    public static class UpdateRecipeDetailRequest {

        private BigDecimal quantityRequired;
        private String note;

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
}
