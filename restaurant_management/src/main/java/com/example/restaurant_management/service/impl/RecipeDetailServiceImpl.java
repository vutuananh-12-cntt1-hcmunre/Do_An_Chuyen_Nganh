
package com.example.restaurant_management.service.impl;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.restaurant_management.dto.RecipeDetail;
import com.example.restaurant_management.dto.RecipeDetailResponse;
import com.example.restaurant_management.repository.RecipeDetailRepository;
import com.example.restaurant_management.service.RecipeDetailService;

@Service
public class RecipeDetailServiceImpl implements RecipeDetailService {

    private final RecipeDetailRepository recipeDetailRepository;

    public RecipeDetailServiceImpl(
            RecipeDetailRepository recipeDetailRepository) {
        this.recipeDetailRepository = recipeDetailRepository;
    }

    // Lấy danh sách nguyên liệu theo món ăn
    @Override
    public List<RecipeDetailResponse> getRecipeByDishId(Integer dishId) {

        if (dishId == null || dishId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mã món ăn không hợp lệ"
            );
        }

        if (!recipeDetailRepository.existsDishById(dishId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy món ăn"
            );
        }

        return recipeDetailRepository.findByDishId(dishId);
    }

    // Lấy chi tiết nguyên liệu trong công thức
    @Override
    public RecipeDetailResponse getRecipeDetailById(
            Integer recipeDetailId) {

        if (recipeDetailId == null || recipeDetailId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mã chi tiết công thức không hợp lệ"
            );
        }

        return recipeDetailRepository.findById(recipeDetailId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy chi tiết công thức"
                ));
    }

    // Thêm nguyên liệu vào công thức
    @Override
    public RecipeDetailResponse addIngredientToRecipe(
            RecipeDetail recipeDetail) {

        if (recipeDetail == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Dữ liệu công thức không được để trống"
            );
        }

        Integer dishId = recipeDetail.getDishId();
        Integer ingredientId = recipeDetail.getIngredientId();
        BigDecimal quantityRequired = recipeDetail.getQuantityRequired();

        if (dishId == null || dishId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mã món ăn không hợp lệ"
            );
        }

        if (ingredientId == null || ingredientId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mã nguyên liệu không hợp lệ"
            );
        }

        if (quantityRequired == null
                || quantityRequired.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Số lượng nguyên liệu phải lớn hơn 0"
            );
        }

        if (quantityRequired.scale() > 3) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Số lượng nguyên liệu chỉ được tối đa 3 chữ số thập phân"
            );
        }

        if (!recipeDetailRepository.existsDishById(dishId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy món ăn"
            );
        }

        if (!recipeDetailRepository.isDishAvailable(dishId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Món ăn hiện không được kinh doanh"
            );
        }

        if (!recipeDetailRepository.existsIngredientById(ingredientId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy nguyên liệu"
            );
        }

        if (!recipeDetailRepository.isIngredientActive(ingredientId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nguyên liệu hiện không hoạt động"
            );
        }

        if (recipeDetailRepository.existsByDishIdAndIngredientId(
                dishId, ingredientId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Nguyên liệu đã tồn tại trong công thức món ăn"
            );
        }

        Integer recipeDetailId = recipeDetailRepository.insert(
                dishId,
                ingredientId,
                quantityRequired,
                recipeDetail.getNote()
        );

        return getRecipeDetailById(recipeDetailId);
    }

    // Cập nhật định lượng nguyên liệu
    @Override
    public RecipeDetailResponse updateRecipeDetail(
            Integer recipeDetailId,
            BigDecimal quantityRequired,
            String note) {

        if (recipeDetailId == null || recipeDetailId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mã chi tiết công thức không hợp lệ"
            );
        }

        if (quantityRequired == null
                || quantityRequired.compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Số lượng nguyên liệu phải lớn hơn 0"
            );
        }

        if (quantityRequired.scale() > 3) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Số lượng nguyên liệu chỉ được tối đa 3 chữ số thập phân"
            );
        }

        if (recipeDetailRepository.findById(recipeDetailId).isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy chi tiết công thức"
            );
        }

        recipeDetailRepository.update(
                recipeDetailId,
                quantityRequired,
                note
        );

        return getRecipeDetailById(recipeDetailId);
    }

    // Xóa nguyên liệu khỏi công thức
    @Override
    public void deleteRecipeDetail(Integer recipeDetailId) {

        if (recipeDetailId == null || recipeDetailId <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mã chi tiết công thức không hợp lệ"
            );
        }

        if (recipeDetailRepository.findById(recipeDetailId).isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy chi tiết công thức"
            );
        }

        recipeDetailRepository.delete(recipeDetailId);
    }
}
