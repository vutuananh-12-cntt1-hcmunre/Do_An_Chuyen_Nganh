
package com.example.restaurant_management.service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.restaurant_management.dto.Ingredient;
import com.example.restaurant_management.dto.IngredientResponse;
import com.example.restaurant_management.repository.IngredientRepository;
import com.example.restaurant_management.service.IngredientService;

@Service
public class IngredientServiceImpl implements IngredientService {

    private final IngredientRepository ingredientRepository;

    public IngredientServiceImpl(IngredientRepository ingredientRepository) {
        this.ingredientRepository = ingredientRepository;
    }

    // Chuyển Ingredient thành IngredientResponse
    private IngredientResponse mapToResponse(Ingredient ingredient) {
        return new IngredientResponse(
            ingredient.getIngredientId(),
            ingredient.getIngredientCode(),
            ingredient.getIngredientName(),
            ingredient.getUnit(),
            ingredient.getStockQuantity(),
            ingredient.getMinStockQuantity(),
            ingredient.getIsActive(),
            ingredient.getCreatedAt(),
            ingredient.getUpdatedAt()
        );
    }

    // Kiểm tra dữ liệu đầu vào
    private void validateIngredient(Ingredient ingredient) {

        if (ingredient == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Dữ liệu nguyên liệu không được để trống"
            );
        }

        if (ingredient.getIngredientName() == null
                || ingredient.getIngredientName().trim().isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Tên nguyên liệu không được để trống"
            );
        }

        ingredient.setIngredientName(
            ingredient.getIngredientName().trim()
        );

        if (ingredient.getUnit() == null
                || ingredient.getUnit().trim().isEmpty()) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Đơn vị tính không được để trống"
            );
        }

        ingredient.setUnit(
            ingredient.getUnit().trim().toUpperCase()
        );

        if (!List.of("KG", "LITER", "BUNDLE")
                .contains(ingredient.getUnit())) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Đơn vị tính chỉ được là KG, LITER hoặc BUNDLE"
            );
        }

        if (ingredient.getStockQuantity() != null
                && ingredient.getStockQuantity().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Số lượng tồn kho không được âm"
            );
        }

        if (ingredient.getMinStockQuantity() != null
                && ingredient.getMinStockQuantity().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Số lượng tồn kho tối thiểu không được âm"
            );
        }
    }

    // Lấy danh sách nguyên liệu
    @Override
    public List<IngredientResponse> getAllIngredients() {
        return ingredientRepository.findAll()
            .stream()
            .map(this::mapToResponse)
            .toList();
    }

    // Lấy nguyên liệu theo ID
    @Override
    public IngredientResponse getIngredientById(Integer ingredientId) {

        Ingredient ingredient = ingredientRepository.findById(ingredientId);

        if (ingredient == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Không tìm thấy nguyên liệu"
            );
        }

        return mapToResponse(ingredient);
    }

    // Thêm nguyên liệu
    @Override
    public IngredientResponse createIngredient(Ingredient ingredient) {

        validateIngredient(ingredient);

        if (ingredientRepository.existsByIngredientName(
                ingredient.getIngredientName())) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Tên nguyên liệu đã tồn tại"
            );
        }

        // Sinh mã nguyên liệu tự động
        String ingredientCode = "ING-"
            + UUID.randomUUID().toString()
                .substring(0, 8)
                .toUpperCase();

        ingredient.setIngredientCode(ingredientCode);

        // Giá trị mặc định
        if (ingredient.getStockQuantity() == null) {
            ingredient.setStockQuantity(BigDecimal.ZERO);
        }

        if (ingredient.getMinStockQuantity() == null) {
            ingredient.setMinStockQuantity(BigDecimal.ZERO);
        }

        ingredient.setIsActive(true);

        Integer ingredientId = ingredientRepository.insert(ingredient);

        return getIngredientById(ingredientId);
    }

    // Cập nhật nguyên liệu
    @Override
    public IngredientResponse updateIngredient(
            Integer ingredientId, Ingredient ingredient) {

        Ingredient existingIngredient =
            ingredientRepository.findById(ingredientId);

        if (existingIngredient == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Không tìm thấy nguyên liệu"
            );
        }

        validateIngredient(ingredient);

        if (ingredientRepository.existsByIngredientNameAndIdNot(
                ingredient.getIngredientName(), ingredientId)) {
            throw new ResponseStatusException(
                HttpStatus.CONFLICT,
                "Tên nguyên liệu đã tồn tại"
            );
        }

        // Chỉ cập nhật thông tin, không thay đổi mã và số lượng tồn kho
        existingIngredient.setIngredientName(
            ingredient.getIngredientName()
        );

        existingIngredient.setUnit(
            ingredient.getUnit()
        );

        existingIngredient.setMinStockQuantity(
            ingredient.getMinStockQuantity() != null
                ? ingredient.getMinStockQuantity()
                : BigDecimal.ZERO
        );

        ingredientRepository.update(existingIngredient);

        return getIngredientById(ingredientId);
    }

    // Kích hoạt / ngừng hoạt động nguyên liệu
    @Override
    public IngredientResponse updateActiveStatus(
            Integer ingredientId, Boolean isActive) {

        Ingredient existingIngredient =
            ingredientRepository.findById(ingredientId);

        if (existingIngredient == null) {
            throw new ResponseStatusException(
                HttpStatus.NOT_FOUND,
                "Không tìm thấy nguyên liệu"
            );
        }

        if (isActive == null) {
            throw new ResponseStatusException(
                HttpStatus.BAD_REQUEST,
                "Trạng thái không được để trống"
            );
        }

        ingredientRepository.updateActiveStatus(
            ingredientId, isActive
        );

        return getIngredientById(ingredientId);
    }
}
