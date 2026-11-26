package com.example.restaurant_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

import com.example.restaurant_management.dto.CategoryRequest;
import com.example.restaurant_management.dto.CategoryResponse;
import com.example.restaurant_management.service.CategoryService;

@RestController
@RequestMapping("/api/categories")
public class CategoryController {

    private final CategoryService categoryService;

    public CategoryController(CategoryService categoryService) {
        this.categoryService = categoryService;
    }

    // Lấy danh sách danh mục
    @GetMapping
    public ResponseEntity<List<CategoryResponse>> getAllCategories() {

        return ResponseEntity.ok(
            categoryService.getAllCategories()
        );
    }

    // Lấy danh mục theo ID
    @GetMapping("/{id}")
    public ResponseEntity<CategoryResponse> getCategoryById(
            @PathVariable Integer id) {

        return ResponseEntity.ok(
            categoryService.getCategoryById(id)
        );
    }

    // Thêm danh mục
    @PostMapping
    public ResponseEntity<Integer> createCategory(
            @Valid @RequestBody CategoryRequest request) {

        Integer categoryId =
                categoryService.createCategory(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(categoryId);
    }

    // Cập nhật danh mục
    @PutMapping("/{id}")
    public ResponseEntity<String> updateCategory(
            @PathVariable Integer id,
            @Valid @RequestBody CategoryRequest request) {

        categoryService.updateCategory(id, request);

        return ResponseEntity.ok(
            "Cập nhật danh mục thành công"
        );
    }

    // Vô hiệu hóa danh mục
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<String> deactivateCategory(
            @PathVariable Integer id) {

        categoryService.deactivateCategory(id);

        return ResponseEntity.ok(
            "Vô hiệu hóa danh mục thành công"
        );
    }

    // Kích hoạt lại danh mục
    @PatchMapping("/{id}/activate")
    public ResponseEntity<String> activateCategory(
            @PathVariable Integer id) {

        categoryService.activateCategory(id);

        return ResponseEntity.ok(
            "Kích hoạt danh mục thành công"
        );
    }
}