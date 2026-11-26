
package com.example.restaurant_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.restaurant_management.dto.DishRequest;
import com.example.restaurant_management.dto.DishResponse;
import com.example.restaurant_management.service.DishService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/dishes")
@Validated
public class DishController {

    private final DishService dishService;

    public DishController(DishService dishService) {
        this.dishService = dishService;
    }

    // Lấy danh sách món ăn
    @GetMapping
    public ResponseEntity<List<DishResponse>> getAllDishes() {
        return ResponseEntity.ok(dishService.getAllDishes());
    }

    // Lấy chi tiết món ăn
    @GetMapping("/{dishId}")
    public ResponseEntity<DishResponse> getDishById(
            @PathVariable Integer dishId) {
        return ResponseEntity.ok(dishService.getDishById(dishId));
    }

    // Lấy danh sách món ăn theo danh mục
    @GetMapping("/category/{categoryId}")
    public ResponseEntity<List<DishResponse>> getDishesByCategory(
            @PathVariable Integer categoryId) {
        return ResponseEntity.ok(
                dishService.getDishesByCategory(categoryId)
        );
    }

    // Thêm món ăn
    @PostMapping
    public ResponseEntity<Integer> createDish(
            @Valid @RequestBody DishRequest request) {
        Integer dishId = dishService.createDish(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(dishId);
    }

    // Cập nhật món ăn
    @PutMapping("/{dishId}")
    public ResponseEntity<String> updateDish(
            @PathVariable Integer dishId,
            @Valid @RequestBody DishRequest request) {

        dishService.updateDish(dishId, request);

        return ResponseEntity.ok("Cập nhật món ăn thành công");
    }

    // Vô hiệu hóa món ăn
    @PatchMapping("/{dishId}/deactivate")
    public ResponseEntity<String> deactivateDish(
            @PathVariable Integer dishId) {

        dishService.deactivateDish(dishId);

        return ResponseEntity.ok("Vô hiệu hóa món ăn thành công");
    }

    // Kích hoạt món ăn
    @PatchMapping("/{dishId}/activate")
    public ResponseEntity<String> activateDish(
            @PathVariable Integer dishId) {

        dishService.activateDish(dishId);

        return ResponseEntity.ok("Kích hoạt món ăn thành công");
    }
}
