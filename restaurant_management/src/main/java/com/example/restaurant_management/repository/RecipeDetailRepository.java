
package com.example.restaurant_management.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.restaurant_management.dto.RecipeDetailResponse;

@Repository
public class RecipeDetailRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public RecipeDetailRepository(
            NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Lấy danh sách nguyên liệu trong công thức của một món ăn
    public List<RecipeDetailResponse> findByDishId(Integer dishId) {

        String sql = """
                SELECT
                    rd.recipe_detail_id,
                    rd.dish_id,
                    d.dish_name,
                    rd.ingredient_id,
                    i.ingredient_name,
                    i.unit,
                    rd.quantity_required,
                    rd.note
                FROM recipe_details rd
                INNER JOIN dishes d
                    ON rd.dish_id = d.dish_id
                INNER JOIN ingredients i
                    ON rd.ingredient_id = i.ingredient_id
                WHERE rd.dish_id = :dishId
                ORDER BY rd.recipe_detail_id
                """;

        return jdbcTemplate.query(
                sql,
                Map.of("dishId", dishId),
                (rs, rowNum) -> new RecipeDetailResponse(
                        rs.getInt("recipe_detail_id"),
                        rs.getInt("dish_id"),
                        rs.getString("dish_name"),
                        rs.getInt("ingredient_id"),
                        rs.getString("ingredient_name"),
                        rs.getString("unit"),
                        rs.getBigDecimal("quantity_required"),
                        rs.getString("note")
                )
        );
    }

    // Lấy chi tiết một nguyên liệu trong công thức
    public Optional<RecipeDetailResponse> findById(
            Integer recipeDetailId) {

        String sql = """
                SELECT
                    rd.recipe_detail_id,
                    rd.dish_id,
                    d.dish_name,
                    rd.ingredient_id,
                    i.ingredient_name,
                    i.unit,
                    rd.quantity_required,
                    rd.note
                FROM recipe_details rd
                INNER JOIN dishes d
                    ON rd.dish_id = d.dish_id
                INNER JOIN ingredients i
                    ON rd.ingredient_id = i.ingredient_id
                WHERE rd.recipe_detail_id = :recipeDetailId
                """;

        List<RecipeDetailResponse> results = jdbcTemplate.query(
                sql,
                Map.of("recipeDetailId", recipeDetailId),
                (rs, rowNum) -> new RecipeDetailResponse(
                        rs.getInt("recipe_detail_id"),
                        rs.getInt("dish_id"),
                        rs.getString("dish_name"),
                        rs.getInt("ingredient_id"),
                        rs.getString("ingredient_name"),
                        rs.getString("unit"),
                        rs.getBigDecimal("quantity_required"),
                        rs.getString("note")
                )
        );

        return results.stream().findFirst();
    }

    // Kiểm tra món ăn có tồn tại không
    public boolean existsDishById(Integer dishId) {

        String sql = """
                SELECT COUNT(*)
                FROM dishes
                WHERE dish_id = :dishId
                """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Map.of("dishId", dishId),
                Integer.class
        );

        return count != null && count > 0;
    }

    // Kiểm tra món ăn có đang kinh doanh không
    public boolean isDishAvailable(Integer dishId) {

        String sql = """
                SELECT COUNT(*)
                FROM dishes
                WHERE dish_id = :dishId
                  AND is_available = 1
                """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Map.of("dishId", dishId),
                Integer.class
        );

        return count != null && count > 0;
    }

    // Kiểm tra nguyên liệu có tồn tại không
    public boolean existsIngredientById(Integer ingredientId) {

        String sql = """
                SELECT COUNT(*)
                FROM ingredients
                WHERE ingredient_id = :ingredientId
                """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Map.of("ingredientId", ingredientId),
                Integer.class
        );

        return count != null && count > 0;
    }

    // Kiểm tra nguyên liệu có đang hoạt động không
    public boolean isIngredientActive(Integer ingredientId) {

        String sql = """
                SELECT COUNT(*)
                FROM ingredients
                WHERE ingredient_id = :ingredientId
                  AND is_active = 1
                """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Map.of("ingredientId", ingredientId),
                Integer.class
        );

        return count != null && count > 0;
    }

    // Kiểm tra nguyên liệu đã có trong công thức chưa
    public boolean existsByDishIdAndIngredientId(
            Integer dishId,
            Integer ingredientId) {

        String sql = """
                SELECT COUNT(*)
                FROM recipe_details
                WHERE dish_id = :dishId
                  AND ingredient_id = :ingredientId
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("dishId", dishId)
                .addValue("ingredientId", ingredientId);

        Integer count = jdbcTemplate.queryForObject(
                sql,
                params,
                Integer.class
        );

        return count != null && count > 0;
    }

    // Thêm nguyên liệu vào công thức
    public Integer insert(
            Integer dishId,
            Integer ingredientId,
            java.math.BigDecimal quantityRequired,
            String note) {

        String sql = """
                INSERT INTO recipe_details (
                    dish_id,
                    ingredient_id,
                    quantity_required,
                    note
                )
                OUTPUT INSERTED.recipe_detail_id
                VALUES (
                    :dishId,
                    :ingredientId,
                    :quantityRequired,
                    :note
                )
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("dishId", dishId)
                .addValue("ingredientId", ingredientId)
                .addValue("quantityRequired", quantityRequired)
                .addValue("note", note);

        return jdbcTemplate.queryForObject(
                sql,
                params,
                Integer.class
        );
    }

    // Cập nhật định lượng và ghi chú
    public boolean update(
            Integer recipeDetailId,
            java.math.BigDecimal quantityRequired,
            String note) {

        String sql = """
                UPDATE recipe_details
                SET quantity_required = :quantityRequired,
                    note = :note
                WHERE recipe_detail_id = :recipeDetailId
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("recipeDetailId", recipeDetailId)
                .addValue("quantityRequired", quantityRequired)
                .addValue("note", note);

        return jdbcTemplate.update(sql, params) > 0;
    }

    // Xóa nguyên liệu khỏi công thức
    public boolean delete(Integer recipeDetailId) {

        String sql = """
                DELETE FROM recipe_details
                WHERE recipe_detail_id = :recipeDetailId
                """;

        return jdbcTemplate.update(
                sql,
                Map.of("recipeDetailId", recipeDetailId)
        ) > 0;
    }
}
