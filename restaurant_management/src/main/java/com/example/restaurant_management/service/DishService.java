package com.example.restaurant_management.service;

import java.util.List;

import com.example.restaurant_management.dto.DishRequest;
import com.example.restaurant_management.dto.DishResponse;

public interface DishService {

    // Lấy danh sách món ăn
    List<DishResponse> getAllDishes();

    // Lấy chi tiết món ăn
    DishResponse getDishById(Integer dishId);

    // Lấy món ăn theo danh mục
    List<DishResponse> getDishesByCategory(Integer categoryId);

    // Thêm món ăn
    Integer createDish(DishRequest request);

    // Cập nhật món ăn
    boolean updateDish(Integer dishId, DishRequest request);

    // Vô hiệu hóa món ăn
    boolean deactivateDish(Integer dishId);

    // Kích hoạt món ăn
    boolean activateDish(Integer dishId);
}