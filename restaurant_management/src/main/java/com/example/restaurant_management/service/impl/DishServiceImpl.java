
package com.example.restaurant_management.service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.restaurant_management.dto.Category;
import com.example.restaurant_management.dto.Dish;
import com.example.restaurant_management.dto.DishRequest;
import com.example.restaurant_management.dto.DishResponse;
import com.example.restaurant_management.dto.User;
import com.example.restaurant_management.repository.CategoryRepository;
import com.example.restaurant_management.repository.DishRepository;
import com.example.restaurant_management.repository.UserRepository;
import com.example.restaurant_management.service.DishService;

@Service
public class DishServiceImpl implements DishService {

    private final DishRepository dishRepository;
    private final CategoryRepository categoryRepository;
    private final UserRepository userRepository;

    public DishServiceImpl(
            DishRepository dishRepository,
            CategoryRepository categoryRepository,
            UserRepository userRepository) {

        this.dishRepository = dishRepository;
        this.categoryRepository = categoryRepository;
        this.userRepository = userRepository;
    }

    // Chuyển Dish thành DishResponse
    private DishResponse convertToResponse(Dish dish) {

        return new DishResponse(
                dish.getDishId(),
                dish.getCategoryId(),
                dish.getCategoryName(),
                dish.getDishName(),
                dish.getDescription(),
                dish.getCurrentPrice(),
                dish.getImageUrl(),
                dish.getIsAvailable(),
                dish.getCreatedAt(),
                dish.getUpdatedAt()
        );
    }

    // Kiểm tra danh mục có tồn tại và đang hoạt động
    private Category validateCategory(Integer categoryId) {

        Category category = categoryRepository.findById(categoryId);

        if (category == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy danh mục"
            );
        }

        if (!Boolean.TRUE.equals(category.getIsActive())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Danh mục hiện không hoạt động"
            );
        }

        return category;
    }

    // Lấy danh sách món ăn
    @Override
    public List<DishResponse> getAllDishes() {

        return dishRepository.findAllWithCategory()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Lấy chi tiết món ăn
    @Override
    public DishResponse getDishById(Integer dishId) {

        Dish dish = dishRepository.findById(dishId);

        if (dish == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy món ăn"
            );
        }

        Category category = categoryRepository.findById(
                dish.getCategoryId()
        );

        if (category != null) {
            dish.setCategoryName(category.getCategoryName());
        }

        return convertToResponse(dish);
    }

    // Lấy danh sách món ăn theo danh mục
    @Override
    public List<DishResponse> getDishesByCategory(Integer categoryId) {

        Category category = categoryRepository.findById(categoryId);

        if (category == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy danh mục"
            );
        }

        List<Dish> dishes = dishRepository.findByCategoryId(categoryId);

        for (Dish dish : dishes) {
            dish.setCategoryName(category.getCategoryName());
        }

        return dishes.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Thêm món ăn
    @Override
    public Integer createDish(DishRequest request) {

        Category category = validateCategory(request.getCategoryId());

        Dish dish = new Dish();

        dish.setCategoryId(request.getCategoryId());
        dish.setCategoryName(category.getCategoryName());
        dish.setDishName(request.getDishName());
        dish.setDescription(request.getDescription());
        dish.setCurrentPrice(request.getCurrentPrice());
        dish.setImageUrl(request.getImageUrl());
        dish.setIsAvailable(true);

        return dishRepository.insert(dish);
    }

    // Cập nhật món ăn
    @Override
    @Transactional
    public boolean updateDish(Integer dishId, DishRequest request) {

        // Tìm món ăn hiện tại
        Dish dish = dishRepository.findById(dishId);

        if (dish == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy món ăn"
            );
        }

        // Kiểm tra danh mục mới
        Category category = validateCategory(request.getCategoryId());

        // Lấy giá cũ và giá mới
        BigDecimal oldPrice = dish.getCurrentPrice();
        BigDecimal newPrice = request.getCurrentPrice();

        // Kiểm tra giá có thay đổi hay không
        boolean priceChanged = oldPrice.compareTo(newPrice) != 0;

        // Cập nhật thông tin món ăn
        dish.setCategoryId(request.getCategoryId());
        dish.setCategoryName(category.getCategoryName());
        dish.setDishName(request.getDishName());
        dish.setDescription(request.getDescription());
        dish.setCurrentPrice(newPrice);
        dish.setImageUrl(request.getImageUrl());

        boolean updated = dishRepository.update(dishId, dish);

        if (!updated) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Cập nhật món ăn thất bại"
            );
        }

        // Nếu giá thay đổi thì ghi lịch sử
        if (priceChanged) {

            // Lấy thông tin tài khoản đang đăng nhập
            Authentication authentication =
                    SecurityContextHolder.getContext().getAuthentication();

            if (authentication == null
                    || !authentication.isAuthenticated()
                    || authentication.getName() == null) {

                throw new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Không xác định được người thực hiện"
                );
            }

            String username = authentication.getName();

            // Tìm tài khoản theo username
            User currentUser = userRepository.findByUsername(username)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.UNAUTHORIZED,
                            "Không tìm thấy tài khoản thực hiện"
                    ));

            // Ghi lịch sử thay đổi giá
            dishRepository.insertPriceHistory(
                    dishId,
                    oldPrice,
                    newPrice,
                    currentUser.getUserId(),
                    "Cập nhật giá món ăn"
            );
        }

        return true;
    }

    // Vô hiệu hóa món ăn
    @Override
    public boolean deactivateDish(Integer dishId) {

        Dish dish = dishRepository.findById(dishId);

        if (dish == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy món ăn"
            );
        }

        if (!Boolean.TRUE.equals(dish.getIsAvailable())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Món ăn đã được vô hiệu hóa"
            );
        }

        return dishRepository.deactivate(dishId);
    }

    // Kích hoạt món ăn
    @Override
    public boolean activateDish(Integer dishId) {

        Dish dish = dishRepository.findById(dishId);

        if (dish == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy món ăn"
            );
        }

        if (Boolean.TRUE.equals(dish.getIsAvailable())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Món ăn đang hoạt động"
            );
        }

        // Chỉ kích hoạt nếu danh mục vẫn đang hoạt động
        validateCategory(dish.getCategoryId());

        return dishRepository.activate(dishId);
    }
}
