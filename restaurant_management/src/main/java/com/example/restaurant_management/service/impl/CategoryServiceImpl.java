package com.example.restaurant_management.service.impl;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.restaurant_management.dto.Category;
import com.example.restaurant_management.dto.CategoryRequest;
import com.example.restaurant_management.dto.CategoryResponse;
import com.example.restaurant_management.repository.CategoryRepository;
import com.example.restaurant_management.service.CategoryService;

@Service
public class CategoryServiceImpl implements CategoryService {
    private final CategoryRepository categoryRepository;
    public CategoryServiceImpl (CategoryRepository categoryRepository){
        this.categoryRepository=categoryRepository;
    }
    private CategoryResponse convertToResponse(Category category){
        return new CategoryResponse(
            category.getCategoryId(),
            category.getCategoryName(),
            category.getDescription(),
            category.getIsActive(),
            category.getCreatedAt()
        );
    }
    @Override
    public List<CategoryResponse> getAllCategories(){
        return categoryRepository.findAll().stream().map(this::convertToResponse).toList();
        
    }
    @Override
    public CategoryResponse getCategoryById(Integer categoryId){
        Category category = categoryRepository.findById(categoryId);
        if(category == null){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,"không tìm thấy danh mục");
        }
        return convertToResponse(category);
    }
    @Override
    public Integer createCategory(CategoryRequest request){
        if(categoryRepository.existsByCategoryName(request.getCategoryName())){
            throw new ResponseStatusException(HttpStatus.CONFLICT,"tên danh mục đã tồn tại");
        }
        Category category = new Category();
        category.setCategoryName(request.getCategoryName());
        category.setDescription(request.getDescription());
        category.setIsActive(true);
        return categoryRepository.insert(category);
    }
    @Override
    public boolean updateCategory(Integer categoryId, CategoryRequest request){
        Category existingCategory= categoryRepository.findById(categoryId);
        if(existingCategory == null){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND,"Không tìm thấy danh mục");
        }
            boolean nameChanged = !existingCategory.getCategoryName().equalsIgnoreCase(request.getCategoryName());
            if(nameChanged && categoryRepository.existsByCategoryName(request.getCategoryName())){
                throw new ResponseStatusException(HttpStatus.CONFLICT,"tên danh mục đã tồn tại");
            }
            Category category = new Category();
            category.setCategoryName(request.getCategoryName());
            category.setDescription(request.getDescription());
            return categoryRepository.update(categoryId, category);
        }

    @Override
    public boolean deactivateCategory(Integer categoryId){
        Category category = categoryRepository.findById(categoryId);
        if(category == null){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy danh mục");
        }
        if(!category.getIsActive()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "danh mục đã được vô hiệu hoá");
        }
        return categoryRepository.deactivate(categoryId);
    }
    @Override
    public boolean activateCategory(Integer categoryId){
        Category category = categoryRepository.findById(categoryId);
        if(category == null){
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "Không tìm thấy danh mục");
        }
        if(category.getIsActive()){
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST, "danh mục đang hoạt động");
        }
        return categoryRepository.activate(categoryId);
    }
    }
