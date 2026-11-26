package com.example.restaurant_management.dto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

public class CategoryRequest {
    @NotBlank(message="tên danh mục không được bỏ trống")
    @Size(max=100, message="tên danh mục không được vượt quá 100 kí tự")
    private String categoryName;

    @NotBlank(message="mô rả không được để trống")
    @Size(max=255, message="mô tả không được vượt quá 255 kí tự")
    private String description;
    public CategoryRequest() {
    }

    public String getCategoryName() {
        return categoryName;
    }

    public void setCategoryName(String categoryName) {
        this.categoryName = categoryName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}
