package com.example.restaurant_management.service;
import java.util.List;

import com.example.restaurant_management.dto.CategoryRequest;
import com.example.restaurant_management.dto.CategoryResponse;

public interface  CategoryService {
    List<CategoryResponse> getAllCategories();
    CategoryResponse getCategoryById(Integer categoryId);
    Integer createCategory(CategoryRequest request);
    boolean updateCategory(Integer categoryId, CategoryRequest request);
    boolean deactivateCategory(Integer categoryId);
    boolean activateCategory(Integer categoryId);
}
