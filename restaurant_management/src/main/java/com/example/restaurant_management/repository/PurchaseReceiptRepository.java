
package com.example.restaurant_management.repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.restaurant_management.dto.PurchaseReceiptResponse;

@Repository
public class PurchaseReceiptRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public PurchaseReceiptRepository(
            NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Lấy danh sách phiếu nhập
    public List<PurchaseReceiptResponse> findAll() {

        String sql = """
                SELECT
                    pr.receipt_id,
                    pr.receipt_code,
                    pr.supplier_id,
                    s.supplier_name,
                    pr.employee_id,
                    pr.receipt_status,
                    pr.total_amount,
                    pr.note,
                    pr.created_at,
                    pr.confirmed_at
                FROM purchase_receipts pr
                INNER JOIN suppliers s
                    ON pr.supplier_id = s.supplier_id
                ORDER BY pr.created_at DESC
                """;

        return jdbcTemplate.query(sql, (rs, rowNum) ->
                new PurchaseReceiptResponse(
                        rs.getInt("receipt_id"),
                        rs.getString("receipt_code"),
                        rs.getInt("supplier_id"),
                        rs.getString("supplier_name"),
                        rs.getInt("employee_id"),
                        rs.getString("receipt_status"),
                        rs.getBigDecimal("total_amount"),
                        rs.getString("note"),
                        rs.getTimestamp("created_at").toLocalDateTime(),
                        rs.getTimestamp("confirmed_at") == null
                                ? null
                                : rs.getTimestamp("confirmed_at").toLocalDateTime()
                )
        );
    }

    // Tìm phiếu nhập theo ID
    public Optional<PurchaseReceiptResponse> findById(
            Integer receiptId) {

        String sql = """
                SELECT
                    pr.receipt_id,
                    pr.receipt_code,
                    pr.supplier_id,
                    s.supplier_name,
                    pr.employee_id,
                    pr.receipt_status,
                    pr.total_amount,
                    pr.note,
                    pr.created_at,
                    pr.confirmed_at
                FROM purchase_receipts pr
                INNER JOIN suppliers s
                    ON pr.supplier_id = s.supplier_id
                WHERE pr.receipt_id = :receiptId
                """;

        List<PurchaseReceiptResponse> results = jdbcTemplate.query(
                sql,
                Map.of("receiptId", receiptId),
                (rs, rowNum) -> new PurchaseReceiptResponse(
                        rs.getInt("receipt_id"),
                        rs.getString("receipt_code"),
                        rs.getInt("supplier_id"),
                        rs.getString("supplier_name"),
                        rs.getInt("employee_id"),
                        rs.getString("receipt_status"),
                        rs.getBigDecimal("total_amount"),
                        rs.getString("note"),
                        rs.getTimestamp("created_at").toLocalDateTime(),
                        rs.getTimestamp("confirmed_at") == null
                                ? null
                                : rs.getTimestamp("confirmed_at").toLocalDateTime()
                )
        );

        return results.stream().findFirst();
    }

    // Kiểm tra nhà cung cấp tồn tại
    public boolean existsSupplierById(Integer supplierId) {

        String sql = """
                SELECT COUNT(*)
                FROM suppliers
                WHERE supplier_id = :supplierId
                """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Map.of("supplierId", supplierId),
                Integer.class
        );

        return count != null && count > 0;
    }

    // Kiểm tra nhà cung cấp đang hoạt động
    public boolean isSupplierActive(Integer supplierId) {

        String sql = """
                SELECT COUNT(*)
                FROM suppliers
                WHERE supplier_id = :supplierId
                  AND is_active = 1
                """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Map.of("supplierId", supplierId),
                Integer.class
        );

        return count != null && count > 0;
    }

    // Kiểm tra nhân viên tồn tại
    public boolean existsEmployeeById(Integer employeeId) {

        String sql = """
                SELECT COUNT(*)
                FROM employees
                WHERE employee_id = :employeeId
                """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Map.of("employeeId", employeeId),
                Integer.class
        );

        return count != null && count > 0;
    }

    // Tạo phiếu nhập mới
    public Integer insert(
            String receiptCode,
            Integer supplierId,
            Integer employeeId,
            String note) {

        String sql = """
                INSERT INTO purchase_receipts (
                    receipt_code,
                    supplier_id,
                    employee_id,
                    receipt_status,
                    total_amount,
                    note
                )
                OUTPUT INSERTED.receipt_id
                VALUES (
                    :receiptCode,
                    :supplierId,
                    :employeeId,
                    'DRAFT',
                    0,
                    :note
                )
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("receiptCode", receiptCode)
                .addValue("supplierId", supplierId)
                .addValue("employeeId", employeeId)
                .addValue("note", note);

        return jdbcTemplate.queryForObject(
                sql,
                params,
                Integer.class
        );
    }

    // Cập nhật thông tin phiếu nhập
    public boolean update(
            Integer receiptId,
            Integer supplierId,
            String note) {

        String sql = """
                UPDATE purchase_receipts
                SET supplier_id = :supplierId,
                    note = :note
                WHERE receipt_id = :receiptId
                  AND receipt_status = 'DRAFT'
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("receiptId", receiptId)
                .addValue("supplierId", supplierId)
                .addValue("note", note);

        return jdbcTemplate.update(sql, params) > 0;
    }

    // Cập nhật tổng tiền phiếu nhập
    public boolean updateTotalAmount(
            Integer receiptId,
            BigDecimal totalAmount) {

        String sql = """
                UPDATE purchase_receipts
                SET total_amount = :totalAmount
                WHERE receipt_id = :receiptId
                  AND receipt_status = 'DRAFT'
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("receiptId", receiptId)
                .addValue("totalAmount", totalAmount);

        return jdbcTemplate.update(sql, params) > 0;
    }

    // Xác nhận phiếu nhập
    public boolean confirm(Integer receiptId) {

        String sql = """
                UPDATE purchase_receipts
                SET receipt_status = 'CONFIRMED',
                    confirmed_at = SYSDATETIME()
                WHERE receipt_id = :receiptId
                  AND receipt_status = 'DRAFT'
                """;

        return jdbcTemplate.update(
                sql,
                Map.of("receiptId", receiptId)
        ) > 0;
    }

    // Hủy phiếu nhập
    public boolean cancel(Integer receiptId) {

        String sql = """
                UPDATE purchase_receipts
                SET receipt_status = 'CANCELLED'
                WHERE receipt_id = :receiptId
                  AND receipt_status = 'DRAFT'
                """;

        return jdbcTemplate.update(
                sql,
                Map.of("receiptId", receiptId)
        ) > 0;
    }
}
