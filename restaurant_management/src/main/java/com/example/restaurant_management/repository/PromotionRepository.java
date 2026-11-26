
package com.example.restaurant_management.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.example.restaurant_management.dto.Promotion;

@Repository
public class PromotionRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public PromotionRepository(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Promotion> promotionRowMapper = (rs, rowNum) -> {
        Promotion promotion = new Promotion();

        promotion.setPromotionId(rs.getInt("promotion_id"));
        promotion.setPromotionCode(rs.getString("promotion_code"));
        promotion.setPromotionName(rs.getString("promotion_name"));
        promotion.setDescription(rs.getString("description"));
        promotion.setDiscountType(rs.getString("discount_type"));
        promotion.setDiscountValue(rs.getBigDecimal("discount_value"));
        promotion.setMinOrderAmount(rs.getBigDecimal("min_order_amount"));
        promotion.setMaxDiscountAmount(rs.getBigDecimal("max_discount_amount"));
        promotion.setStartAt(rs.getTimestamp("start_at").toLocalDateTime());
        promotion.setEndAt(rs.getTimestamp("end_at").toLocalDateTime());
        promotion.setUsageLimit((Integer) rs.getObject("usage_limit"));
        promotion.setUsedCount(rs.getInt("used_count"));
        promotion.setIsActive(rs.getBoolean("is_active"));
        promotion.setCreatedAt(rs.getTimestamp("created_at").toLocalDateTime());

        return promotion;
    };

    public List<Promotion> findAll() {
        String sql = """
            SELECT *
            FROM promotions
            ORDER BY promotion_id DESC
            """;

        return jdbcTemplate.query(sql, promotionRowMapper);
    }

    public Optional<Promotion> findById(Integer promotionId) {
        String sql = """
            SELECT *
            FROM promotions
            WHERE promotion_id = :promotionId
            """;

        List<Promotion> results = jdbcTemplate.query(
            sql,
            new MapSqlParameterSource("promotionId", promotionId),
            promotionRowMapper
        );

        return results.stream().findFirst();
    }

    public Optional<Promotion> findByCode(String promotionCode) {
        String sql = """
            SELECT *
            FROM promotions
            WHERE promotion_code = :promotionCode
            """;

        List<Promotion> results = jdbcTemplate.query(
            sql,
            new MapSqlParameterSource("promotionCode", promotionCode),
            promotionRowMapper
        );

        return results.stream().findFirst();
    }

    // Lấy mã khuyến mãi và khóa bản ghi trong transaction
    public Optional<Promotion> findByCodeForUpdate(String promotionCode) {
        String sql = """
            SELECT *
            FROM promotions WITH (UPDLOCK, ROWLOCK)
            WHERE promotion_code = :promotionCode
            """;

        List<Promotion> results = jdbcTemplate.query(
            sql,
            new MapSqlParameterSource("promotionCode", promotionCode),
            promotionRowMapper
        );

        return results.stream().findFirst();
    }

    public boolean existsByCode(String promotionCode) {
        String sql = """
            SELECT COUNT(*)
            FROM promotions
            WHERE promotion_code = :promotionCode
            """;

        Integer count = jdbcTemplate.queryForObject(
            sql,
            new MapSqlParameterSource("promotionCode", promotionCode),
            Integer.class
        );

        return count != null && count > 0;
    }

    public boolean existsByCodeAndIdNot(
            String promotionCode,
            Integer promotionId) {

        String sql = """
            SELECT COUNT(*)
            FROM promotions
            WHERE promotion_code = :promotionCode
              AND promotion_id <> :promotionId
            """;

        Integer count = jdbcTemplate.queryForObject(
            sql,
            new MapSqlParameterSource()
                .addValue("promotionCode", promotionCode)
                .addValue("promotionId", promotionId),
            Integer.class
        );

        return count != null && count > 0;
    }

    public Integer insert(Promotion promotion) {
        String sql = """
            INSERT INTO promotions (
                promotion_code,
                promotion_name,
                description,
                discount_type,
                discount_value,
                min_order_amount,
                max_discount_amount,
                start_at,
                end_at,
                usage_limit,
                used_count,
                is_active
            )
            VALUES (
                :promotionCode,
                :promotionName,
                :description,
                :discountType,
                :discountValue,
                :minOrderAmount,
                :maxDiscountAmount,
                :startAt,
                :endAt,
                :usageLimit,
                :usedCount,
                :isActive
            )
            """;

        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("promotionCode", promotion.getPromotionCode())
            .addValue("promotionName", promotion.getPromotionName())
            .addValue("description", promotion.getDescription())
            .addValue("discountType", promotion.getDiscountType())
            .addValue("discountValue", promotion.getDiscountValue())
            .addValue("minOrderAmount", promotion.getMinOrderAmount())
            .addValue("maxDiscountAmount", promotion.getMaxDiscountAmount())
            .addValue("startAt", promotion.getStartAt())
            .addValue("endAt", promotion.getEndAt())
            .addValue("usageLimit", promotion.getUsageLimit())
            .addValue("usedCount", promotion.getUsedCount())
            .addValue("isActive", promotion.getIsActive());

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(
            sql,
            params,
            keyHolder,
            new String[]{"promotion_id"}
        );

        Number key = keyHolder.getKey();

        return key != null ? key.intValue() : null;
    }

    public int update(Integer promotionId, Promotion promotion) {
        String sql = """
            UPDATE promotions
            SET promotion_code = :promotionCode,
                promotion_name = :promotionName,
                description = :description,
                discount_type = :discountType,
                discount_value = :discountValue,
                min_order_amount = :minOrderAmount,
                max_discount_amount = :maxDiscountAmount,
                start_at = :startAt,
                end_at = :endAt,
                usage_limit = :usageLimit,
                is_active = :isActive
            WHERE promotion_id = :promotionId
            """;

        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("promotionId", promotionId)
            .addValue("promotionCode", promotion.getPromotionCode())
            .addValue("promotionName", promotion.getPromotionName())
            .addValue("description", promotion.getDescription())
            .addValue("discountType", promotion.getDiscountType())
            .addValue("discountValue", promotion.getDiscountValue())
            .addValue("minOrderAmount", promotion.getMinOrderAmount())
            .addValue("maxDiscountAmount", promotion.getMaxDiscountAmount())
            .addValue("startAt", promotion.getStartAt())
            .addValue("endAt", promotion.getEndAt())
            .addValue("usageLimit", promotion.getUsageLimit())
            .addValue("isActive", promotion.getIsActive());

        return jdbcTemplate.update(sql, params);
    }

    public int updateActiveStatus(Integer promotionId, Boolean isActive) {
        String sql = """
            UPDATE promotions
            SET is_active = :isActive
            WHERE promotion_id = :promotionId
            """;

        return jdbcTemplate.update(
            sql,
            new MapSqlParameterSource()
                .addValue("promotionId", promotionId)
                .addValue("isActive", isActive)
        );
    }

    // Tăng lượt sử dụng, đồng thời kiểm tra giới hạn
    public int incrementUsedCount(Integer promotionId) {
        String sql = """
            UPDATE promotions
            SET used_count = used_count + 1
            WHERE promotion_id = :promotionId
              AND (
                  usage_limit IS NULL
                  OR used_count < usage_limit
              )
            """;

        return jdbcTemplate.update(
            sql,
            new MapSqlParameterSource("promotionId", promotionId)
        );
    }

    public List<Promotion> findCurrentlyAvailable() {
        String sql = """
            SELECT *
            FROM promotions
            WHERE is_active = 1
              AND start_at <= SYSDATETIME()
              AND end_at >= SYSDATETIME()
              AND (
                  usage_limit IS NULL
                  OR used_count < usage_limit
              )
            ORDER BY end_at ASC
            """;

        return jdbcTemplate.query(sql, promotionRowMapper);
    }
}
