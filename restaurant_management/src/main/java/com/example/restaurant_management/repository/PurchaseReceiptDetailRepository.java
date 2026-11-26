
package com.example.restaurant_management.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.restaurant_management.dto.PurchaseReceiptDetailResponse;

@Repository
public class PurchaseReceiptDetailRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public PurchaseReceiptDetailRepository(
            NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Lấy danh sách chi tiết theo phiếu nhập
    public List<PurchaseReceiptDetailResponse> findByReceiptId(
            Integer receiptId) {

        String sql = """
                SELECT
                    rd.receipt_detail_id,
                    rd.receipt_id,
                    rd.ingredient_id,
                    i.ingredient_name,
                    i.unit,
                    rd.quantity,
                    rd.unit_price,
                    rd.subtotal
                FROM purchase_receipt_details rd
                INNER JOIN ingredients i
                    ON rd.ingredient_id = i.ingredient_id
                WHERE rd.receipt_id = :receiptId
                ORDER BY rd.receipt_detail_id
                """;

        return jdbcTemplate.query(
                sql,
                Map.of("receiptId", receiptId),
                (rs, rowNum) -> new PurchaseReceiptDetailResponse(
                        rs.getInt("receipt_detail_id"),
                        rs.getInt("receipt_id"),
                        rs.getInt("ingredient_id"),
                        rs.getString("ingredient_name"),
                        rs.getString("unit"),
                        rs.getBigDecimal("quantity"),
                        rs.getBigDecimal("unit_price"),
                        rs.getBigDecimal("subtotal")
                )
        );
    }

    // Tìm chi tiết phiếu nhập theo ID
    public Optional<PurchaseReceiptDetailResponse> findById(
            Integer receiptDetailId) {

        String sql = """
                SELECT
                    rd.receipt_detail_id,
                    rd.receipt_id,
                    rd.ingredient_id,
                    i.ingredient_name,
                    i.unit,
                    rd.quantity,
                    rd.unit_price,
                    rd.subtotal
                FROM purchase_receipt_details rd
                INNER JOIN ingredients i
                    ON rd.ingredient_id = i.ingredient_id
                WHERE rd.receipt_detail_id = :receiptDetailId
                """;

        List<PurchaseReceiptDetailResponse> results =
                jdbcTemplate.query(
                        sql,
                        Map.of("receiptDetailId", receiptDetailId),
                        (rs, rowNum) -> new PurchaseReceiptDetailResponse(
                                rs.getInt("receipt_detail_id"),
                                rs.getInt("receipt_id"),
                                rs.getInt("ingredient_id"),
                                rs.getString("ingredient_name"),
                                rs.getString("unit"),
                                rs.getBigDecimal("quantity"),
                                rs.getBigDecimal("unit_price"),
                                rs.getBigDecimal("subtotal")
                        )
                );

        return results.stream().findFirst();
    }

    // Kiểm tra nguyên liệu tồn tại
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

    // Kiểm tra nguyên liệu đang hoạt động
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

    // Kiểm tra nguyên liệu đã có trong phiếu nhập chưa
    public boolean existsByReceiptIdAndIngredientId(
            Integer receiptId,
            Integer ingredientId) {

        String sql = """
                SELECT COUNT(*)
                FROM purchase_receipt_details
                WHERE receipt_id = :receiptId
                  AND ingredient_id = :ingredientId
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("receiptId", receiptId)
                .addValue("ingredientId", ingredientId);

        Integer count = jdbcTemplate.queryForObject(
                sql,
                params,
                Integer.class
        );

        return count != null && count > 0;
    }

    // Thêm nguyên liệu vào phiếu nhập
    public Integer insert(
            Integer receiptId,
            Integer ingredientId,
            BigDecimal quantity,
            BigDecimal unitPrice) {

        BigDecimal subtotal = quantity
                .multiply(unitPrice)
                .setScale(2, java.math.RoundingMode.HALF_UP);

        String sql = """
                INSERT INTO purchase_receipt_details (
                    receipt_id,
                    ingredient_id,
                    quantity,
                    unit_price,
                    subtotal
                )
                OUTPUT INSERTED.receipt_detail_id
                VALUES (
                    :receiptId,
                    :ingredientId,
                    :quantity,
                    :unitPrice,
                    :subtotal
                )
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("receiptId", receiptId)
                .addValue("ingredientId", ingredientId)
                .addValue("quantity", quantity)
                .addValue("unitPrice", unitPrice)
                .addValue("subtotal", subtotal);

        return jdbcTemplate.queryForObject(
                sql,
                params,
                Integer.class
        );
    }

    // Cập nhật số lượng và đơn giá
    public boolean update(
            Integer receiptDetailId,
            BigDecimal quantity,
            BigDecimal unitPrice) {

        BigDecimal subtotal = quantity
                .multiply(unitPrice)
                .setScale(2, java.math.RoundingMode.HALF_UP);

        String sql = """
                UPDATE purchase_receipt_details
                SET quantity = :quantity,
                    unit_price = :unitPrice,
                    subtotal = :subtotal
                WHERE receipt_detail_id = :receiptDetailId
                  AND EXISTS (
                      SELECT 1
                      FROM purchase_receipts pr
                      WHERE pr.receipt_id =
                            purchase_receipt_details.receipt_id
                        AND pr.receipt_status = 'DRAFT'
                  )
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("receiptDetailId", receiptDetailId)
                .addValue("quantity", quantity)
                .addValue("unitPrice", unitPrice)
                .addValue("subtotal", subtotal);

        return jdbcTemplate.update(sql, params) > 0;
    }

    // Xóa nguyên liệu khỏi phiếu nhập
    public boolean delete(Integer receiptDetailId) {

        String sql = """
                DELETE FROM purchase_receipt_details
                WHERE receipt_detail_id = :receiptDetailId
                  AND EXISTS (
                      SELECT 1
                      FROM purchase_receipts pr
                      WHERE pr.receipt_id =
                            purchase_receipt_details.receipt_id
                        AND pr.receipt_status = 'DRAFT'
                  )
                """;

        return jdbcTemplate.update(
                sql,
                Map.of("receiptDetailId", receiptDetailId)
        ) > 0;
    }

    // Tính tổng tiền phiếu nhập
    public BigDecimal calculateTotalAmount(Integer receiptId) {

        String sql = """
                SELECT COALESCE(SUM(subtotal), 0)
                FROM purchase_receipt_details
                WHERE receipt_id = :receiptId
                """;

        BigDecimal total = jdbcTemplate.queryForObject(
                sql,
                Map.of("receiptId", receiptId),
                BigDecimal.class
        );

        return total != null ? total : BigDecimal.ZERO;
    }

    // Lấy danh sách nguyên liệu và số lượng để cộng tồn kho
    public List<Map<String, Object>> findStockItemsByReceiptId(
            Integer receiptId) {

        String sql = """
                SELECT
                    ingredient_id,
                    quantity
                FROM purchase_receipt_details
                WHERE receipt_id = :receiptId
                """;

        return jdbcTemplate.queryForList(
                sql,
                Map.of("receiptId", receiptId)
        );
    }

    // Cộng số lượng nhập vào tồn kho
    public boolean increaseIngredientStock(
            Integer ingredientId,
            BigDecimal quantity) {

        String sql = """
                UPDATE ingredients
                SET stock_quantity = stock_quantity + :quantity,
                    updated_at = SYSDATETIME()
                WHERE ingredient_id = :ingredientId
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("ingredientId", ingredientId)
                .addValue("quantity", quantity);

        return jdbcTemplate.update(sql, params) > 0;
    }
}
