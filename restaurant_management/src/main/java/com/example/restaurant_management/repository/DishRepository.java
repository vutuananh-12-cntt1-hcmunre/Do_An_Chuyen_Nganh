package com.example.restaurant_management.repository;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.restaurant_management.dto.Dish;
import com.example.restaurant_management.dto.PopularDish;

@Repository
public class DishRepository {

    private final NamedParameterJdbcTemplate connection;

    public DishRepository(NamedParameterJdbcTemplate connection) {
        this.connection = connection;
    }

    // Lấy danh sách tất cả món ăn
    public List<Dish> findAll() {

        String sql = """
            SELECT
                d.dish_id AS dishId,
                d.category_id AS categoryId,
                d.dish_name AS dishName,
                d.description,
                d.current_price AS currentPrice,
                d.image_url AS imageUrl,
                d.is_available AS isAvailable,
                d.created_at AS createdAt,
                d.updated_at AS updatedAt
            FROM dishes d
            ORDER BY d.dish_id DESC
            """;

        return connection.query(
            sql,
            new BeanPropertyRowMapper<>(Dish.class)
        );
    }

    // Lấy chi tiết món ăn theo ID
    public Dish findById(Integer dishId) {

        String sql = """
            SELECT
                d.dish_id AS dishId,
                d.category_id AS categoryId,
                d.dish_name AS dishName,
                d.description,
                d.current_price AS currentPrice,
                d.image_url AS imageUrl,
                d.is_available AS isAvailable,
                d.created_at AS createdAt,
                d.updated_at AS updatedAt
            FROM dishes d
            WHERE d.dish_id = :dishId
            """;

        var params = new MapSqlParameterSource()
                .addValue("dishId", dishId);

        List<Dish> dishes = connection.query(
            sql,
            params,
            new BeanPropertyRowMapper<>(Dish.class)
        );

        return dishes.isEmpty() ? null : dishes.get(0);
    }

    // Kiểm tra món ăn có tồn tại hay không
    public boolean existsById(Integer dishId) {

        String sql = """
            SELECT COUNT(*)
            FROM dishes
            WHERE dish_id = :dishId
            """;

        var params = new MapSqlParameterSource()
                .addValue("dishId", dishId);

        Integer count = connection.queryForObject(
            sql,
            params,
            Integer.class
        );

        return count != null && count > 0;
    }

    // Lấy danh sách món ăn kèm tên danh mục
    public List<Dish> findAllWithCategory() {

        String sql = """
            SELECT
                d.dish_id AS dishId,
                d.category_id AS categoryId,
                c.category_name AS categoryName,
                d.dish_name AS dishName,
                d.description,
                d.current_price AS currentPrice,
                d.image_url AS imageUrl,
                d.is_available AS isAvailable,
                d.created_at AS createdAt,
                d.updated_at AS updatedAt
            FROM dishes d
            INNER JOIN categories c
                ON d.category_id = c.category_id
            ORDER BY d.dish_id DESC
            """;

        return connection.query(
            sql,
            new BeanPropertyRowMapper<>(Dish.class)
        );
    }

    // Lấy món ăn theo danh mục
    public List<Dish> findByCategoryId(Integer categoryId) {

        String sql = """
            SELECT
                d.dish_id AS dishId,
                d.category_id AS categoryId,
                d.dish_name AS dishName,
                d.description,
                d.current_price AS currentPrice,
                d.image_url AS imageUrl,
                d.is_available AS isAvailable,
                d.created_at AS createdAt,
                d.updated_at AS updatedAt
            FROM dishes d
            WHERE d.category_id = :categoryId
            ORDER BY d.dish_id DESC
            """;

        var params = new MapSqlParameterSource()
                .addValue("categoryId", categoryId);

        return connection.query(
            sql,
            params,
            new BeanPropertyRowMapper<>(Dish.class)
        );
    }

    // Thêm món ăn
    public Integer insert(Dish dish) {

        String sql = """
            INSERT INTO dishes (
                category_id,
                dish_name,
                description,
                current_price,
                image_url
            )
            OUTPUT INSERTED.dish_id
            VALUES (
                :categoryId,
                :dishName,
                :description,
                :currentPrice,
                :imageUrl
            )
            """;

        var params = new MapSqlParameterSource()
                .addValue("categoryId", dish.getCategoryId())
                .addValue("dishName", dish.getDishName())
                .addValue("description", dish.getDescription())
                .addValue("currentPrice", dish.getCurrentPrice())
                .addValue("imageUrl", dish.getImageUrl());

        return connection.queryForObject(
            sql,
            params,
            Integer.class
        );
    }

    // Cập nhật thông tin món ăn
    public boolean update(Integer dishId, Dish dish) {

        String sql = """
            UPDATE dishes
            SET
                category_id = :categoryId,
                dish_name = :dishName,
                description = :description,
                current_price = :currentPrice,
                image_url = :imageUrl,
                updated_at = SYSDATETIME()
            WHERE dish_id = :dishId
            """;

        var params = new MapSqlParameterSource()
                .addValue("dishId", dishId)
                .addValue("categoryId", dish.getCategoryId())
                .addValue("dishName", dish.getDishName())
                .addValue("description", dish.getDescription())
                .addValue("currentPrice", dish.getCurrentPrice())
                .addValue("imageUrl", dish.getImageUrl());

        return connection.update(sql, params) > 0;
    }

    // Bật trạng thái kinh doanh
    public boolean activate(Integer dishId) {

        String sql = """
            UPDATE dishes
            SET
                is_available = 1,
                updated_at = SYSDATETIME()
            WHERE dish_id = :dishId
            """;

        var params = new MapSqlParameterSource()
                .addValue("dishId", dishId);

        return connection.update(sql, params) > 0;
    }

    // Tắt trạng thái kinh doanh
    public boolean deactivate(Integer dishId) {

        String sql = """
            UPDATE dishes
            SET
                is_available = 0,
                updated_at = SYSDATETIME()
            WHERE dish_id = :dishId
            """;

        var params = new MapSqlParameterSource()
                .addValue("dishId", dishId);

        return connection.update(sql, params) > 0;
    }

    
public void insertPriceHistory(
        Integer dishId,
        BigDecimal oldPrice,
        BigDecimal newPrice,
        Integer changedBy,
        String changeReason) {

    String sql = """
        INSERT INTO dish_price_history (
            dish_id,
            old_price,
            new_price,
            changed_by,
            changed_at,
            change_reason
        )
        VALUES (
            :dishId,
            :oldPrice,
            :newPrice,
            :changedBy,
            SYSDATETIME(),
            :changeReason
        )
        """;

    var params = new MapSqlParameterSource()
            .addValue("dishId", dishId)
            .addValue("oldPrice", oldPrice)
            .addValue("newPrice", newPrice)
            .addValue("changedBy", changedBy)
            .addValue("changeReason", changeReason);

    connection.update(sql, params);
}
// Tìm món ăn theo tên
public List<Dish> searchByName(String dishName) {

    String sql = """
        SELECT
            d.dish_id AS dishId,
            d.category_id AS categoryId,
            d.dish_name AS dishName,
            d.description,
            d.current_price AS currentPrice,
            d.image_url AS imageUrl,
            d.is_available AS isAvailable
        FROM dishes d
        WHERE d.dish_name LIKE :dishName
          AND d.is_available = 1
        ORDER BY d.dish_name
        """;

    var params = new MapSqlParameterSource()
            .addValue("dishName", "%" + dishName + "%");

    return connection.query(
        sql,
        params,
        new BeanPropertyRowMapper<>(Dish.class)
    );
}

// Lọc món ăn theo khoảng giá
public List<Dish> findByPriceRange(
        BigDecimal minPrice,
        BigDecimal maxPrice,
        String dishName) {

    String sql = """
        SELECT
            d.dish_id AS dishId,
            d.category_id AS categoryId,
            d.dish_name AS dishName,
            d.description,
            d.current_price AS currentPrice,
            d.image_url AS imageUrl,
            d.is_available AS isAvailable
        FROM dishes d
        WHERE d.is_available = 1
          AND (:minPrice IS NULL OR d.current_price >= :minPrice)
          AND (:maxPrice IS NULL OR d.current_price <= :maxPrice)
          AND (:dishName IS NULL OR d.dish_name LIKE :dishName)
        ORDER BY d.current_price ASC
        """;

    var params = new MapSqlParameterSource()
            .addValue("minPrice", minPrice)
            .addValue("maxPrice", maxPrice)
            .addValue(
                "dishName",
                dishName == null ? null : "%" + dishName + "%"
            );

    return connection.query(
        sql,
        params,
        new BeanPropertyRowMapper<>(Dish.class)
    );
}

    // Lấy Top 5 món ăn bán chạy nhất
   // Lấy Top 5 món ăn bán chạy nhất
public List<PopularDish> findTopSellingDishes() {

    String sql = """
        SELECT TOP 5
            d.dish_id AS dishId,
            d.dish_name AS dishName,
            SUM(oi.quantity) AS totalSold
        FROM orders o
        INNER JOIN order_items oi
            ON o.order_id = oi.order_id
        INNER JOIN dishes d
            ON oi.dish_id = d.dish_id
        WHERE o.order_status = 'COMPLETED'
            AND d.is_available = 1
        GROUP BY d.dish_id, d.dish_name
        ORDER BY SUM(oi.quantity) DESC, d.dish_id ASC
        """;

    return connection.query(sql, (rs, rowNum) -> {

        return new PopularDish(
                rs.getInt("dishId"),
                rs.getString("dishName"),
                rs.getLong("totalSold")
        );

    });
}

}