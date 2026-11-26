
package com.example.restaurant_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.restaurant_management.dto.Ingredient;
import com.example.restaurant_management.dto.IngredientResponse;
import com.example.restaurant_management.service.IngredientService;

@RestController
@RequestMapping("/api/ingredients")
@CrossOrigin("*")
public class IngredientController {

    private final IngredientService ingredientService;

    public IngredientController(IngredientService ingredientService) {
        this.ingredientService = ingredientService;
    }

    // Lấy danh sách nguyên liệu
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<IngredientResponse>> getAllIngredients() {

        return ResponseEntity.ok(
            ingredientService.getAllIngredients()
        );
    }

    // Lấy nguyên liệu theo ID
    @GetMapping("/{ingredientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<IngredientResponse> getIngredientById(
            @PathVariable Integer ingredientId) {

        return ResponseEntity.ok(
            ingredientService.getIngredientById(ingredientId)
        );
    }

    // Thêm nguyên liệu
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<IngredientResponse> createIngredient(
            @RequestBody Ingredient ingredient) {

        return ResponseEntity.status(HttpStatus.CREATED)
            .body(ingredientService.createIngredient(ingredient));
    }

    // Cập nhật nguyên liệu
    @PutMapping("/{ingredientId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<IngredientResponse> updateIngredient(
            @PathVariable Integer ingredientId,
            @RequestBody Ingredient ingredient) {

        return ResponseEntity.ok(
            ingredientService.updateIngredient(ingredientId, ingredient)
        );
    }

    // Kích hoạt nguyên liệu
    @PatchMapping("/{ingredientId}/activate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<IngredientResponse> activateIngredient(
            @PathVariable Integer ingredientId) {

        return ResponseEntity.ok(
            ingredientService.updateActiveStatus(ingredientId, true)
        );
    }

    // Ngừng hoạt động nguyên liệu
    @PatchMapping("/{ingredientId}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<IngredientResponse> deactivateIngredient(
            @PathVariable Integer ingredientId) {

        return ResponseEntity.ok(
            ingredientService.updateActiveStatus(ingredientId, false)
        );
    }
}
