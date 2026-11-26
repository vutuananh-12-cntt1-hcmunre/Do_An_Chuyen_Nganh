
package com.example.restaurant_management.repository;

import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.example.restaurant_management.dto.Ingredient;

@Repository
public class IngredientRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public IngredientRepository(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Ingredient> rowMapper = (rs, rowNum) -> {
        Ingredient ingredient = new Ingredient();

        ingredient.setIngredientId(rs.getInt("ingredient_id"));
        ingredient.setIngredientCode(rs.getString("ingredient_code"));
        ingredient.setIngredientName(rs.getString("ingredient_name"));
        ingredient.setUnit(rs.getString("unit"));
        ingredient.setStockQuantity(rs.getBigDecimal("stock_quantity"));
        ingredient.setMinStockQuantity(rs.getBigDecimal("min_stock_quantity"));
        ingredient.setIsActive(rs.getBoolean("is_active"));
        ingredient.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());

        if (rs.getTimestamp("updated_at") != null) {
            ingredient.setUpdatedAt(
                rs.getTimestamp("updated_at").toLocalDateTime()
            );
        }

        return ingredient;
    };

    // Lấy danh sách nguyên liệu
    public List<Ingredient> findAll() {
        String sql = """
            SELECT *
            FROM ingredients
            ORDER BY ingredient_id DESC
            """;

        return jdbcTemplate.query(sql, rowMapper);
    }

    // Lấy nguyên liệu theo ID
    public Ingredient findById(Integer ingredientId) {
        String sql = """
            SELECT *
            FROM ingredients
            WHERE ingredient_id = :ingredientId
            """;

        List<Ingredient> ingredients = jdbcTemplate.query(
            sql,
            Map.of("ingredientId", ingredientId),
            rowMapper
        );

        return ingredients.isEmpty() ? null : ingredients.get(0);
    }

    // Kiểm tra tên nguyên liệu đã tồn tại
    public boolean existsByIngredientName(String ingredientName) {
        String sql = """
            SELECT COUNT(*)
            FROM ingredients
            WHERE ingredient_name = :ingredientName
            """;

        Integer count = jdbcTemplate.queryForObject(
            sql,
            Map.of("ingredientName", ingredientName),
            Integer.class
        );

        return count != null && count > 0;
    }

    // Kiểm tra tên nguyên liệu đã tồn tại ở ID khác
    public boolean existsByIngredientNameAndIdNot(
            String ingredientName, Integer ingredientId) {

        String sql = """
            SELECT COUNT(*)
            FROM ingredients
            WHERE ingredient_name = :ingredientName
              AND ingredient_id <> :ingredientId
            """;

        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("ingredientName", ingredientName)
            .addValue("ingredientId", ingredientId);

        Integer count = jdbcTemplate.queryForObject(
            sql,
            params,
            Integer.class
        );

        return count != null && count > 0;
    }

    // Thêm nguyên liệu
    public Integer insert(Ingredient ingredient) {
        String sql = """
            INSERT INTO ingredients (
                ingredient_code,
                ingredient_name,
                unit,
                stock_quantity,
                min_stock_quantity,
                is_active
            )
            VALUES (
                :ingredientCode,
                :ingredientName,
                :unit,
                :stockQuantity,
                :minStockQuantity,
                :isActive
            )
            """;

        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("ingredientCode", ingredient.getIngredientCode())
            .addValue("ingredientName", ingredient.getIngredientName())
            .addValue("unit", ingredient.getUnit())
            .addValue("stockQuantity", ingredient.getStockQuantity())
            .addValue("minStockQuantity", ingredient.getMinStockQuantity())
            .addValue("isActive", ingredient.getIsActive());

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(sql, params, keyHolder, new String[] {"ingredient_id"});

        return keyHolder.getKey().intValue();
    }

    // Cập nhật nguyên liệu
    public int update(Ingredient ingredient) {
        String sql = """
            UPDATE ingredients
            SET ingredient_name = :ingredientName,
                unit = :unit,
                min_stock_quantity = :minStockQuantity,
                updated_at = SYSDATETIME()
            WHERE ingredient_id = :ingredientId
            """;

        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("ingredientId", ingredient.getIngredientId())
            .addValue("ingredientName", ingredient.getIngredientName())
            .addValue("unit", ingredient.getUnit())
            .addValue("minStockQuantity", ingredient.getMinStockQuantity());

        return jdbcTemplate.update(sql, params);
    }

    // Cập nhật trạng thái nguyên liệu
    public int updateActiveStatus(Integer ingredientId, Boolean isActive) {
        String sql = """
            UPDATE ingredients
            SET is_active = :isActive,
                updated_at = SYSDATETIME()
            WHERE ingredient_id = :ingredientId
            """;

        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("ingredientId", ingredientId)
            .addValue("isActive", isActive);

        return jdbcTemplate.update(sql, params);
    }
}
