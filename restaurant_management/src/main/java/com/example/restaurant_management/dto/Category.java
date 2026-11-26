package com.example.restaurant_management.dto;

import java.time.LocalDateTime;

public class Category {
    private Integer categoryId;
    private String categoryName;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public Integer getCategoryId(){
        return categoryId;
    }
    public void setCategoryId(Integer categoryId){
        this.categoryId=categoryId;
    }
    public String getCategoryName(){
        return categoryName;
    }
    public void setCategoryName(String categoryName){
        this.categoryName=categoryName;
    }
    public String getDescription(){
        return description;
    }
    public void setDescription(String description){
        this.description=description;
    }
    public Boolean getIsActive(){
        return isActive;
    }
    public void setIsActive(Boolean isActive){
        this.isActive=isActive;
    }
    public LocalDateTime getCreatedAt(){
        return createdAt;
    }
    public void setCreatedAt(LocalDateTime createdAt){
        this.createdAt=createdAt;
    }
    public Category() {
    }

    // Constructor đầy đủ tham số
    public Category(
            Integer categoryId,
            String categoryName,
            String description,
            Boolean isActive,
            LocalDateTime createdAt
    ) {
        this.categoryId = categoryId;
        this.categoryName = categoryName;
        this.description = description;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }
}
