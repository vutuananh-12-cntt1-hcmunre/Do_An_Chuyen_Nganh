
package com.example.restaurant_management.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.restaurant_management.dto.Invoice;
import com.example.restaurant_management.dto.InvoiceResponse;

@Repository
public class InvoiceRepository {

    private final NamedParameterJdbcTemplate connection;

    public InvoiceRepository(NamedParameterJdbcTemplate connection) {
        this.connection = connection;
    }

    // Lấy danh sách hóa đơn
    public List<InvoiceResponse> findAll() {

        String sql = """
            SELECT
                i.invoice_id,
                i.invoice_code,
                i.order_id,
                o.order_code,
                u.username,
                i.invoice_status,
                i.subtotal,
                i.discount_amount,
                i.tax_amount,
                i.total_amount,
                i.issued_at,
                i.created_at
            FROM invoices i
            INNER JOIN orders o ON i.order_id = o.order_id
            INNER JOIN users u ON o.user_id = u.user_id
            ORDER BY i.created_at DESC
            """;

        return connection.query(sql, (rs, rowNum) -> mapInvoiceResponse(rs));
    }

    // Tìm hóa đơn theo ID
    public InvoiceResponse findById(Integer invoiceId) {

        String sql = """
            SELECT
                i.invoice_id,
                i.invoice_code,
                i.order_id,
                o.order_code,
                u.username,
                i.invoice_status,
                i.subtotal,
                i.discount_amount,
                i.tax_amount,
                i.total_amount,
                i.issued_at,
                i.created_at
            FROM invoices i
            INNER JOIN orders o ON i.order_id = o.order_id
            INNER JOIN users u ON o.user_id = u.user_id
            WHERE i.invoice_id = :invoiceId
            """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("invoiceId", invoiceId);

        List<InvoiceResponse> results = connection.query(
                sql,
                params,
                (rs, rowNum) -> mapInvoiceResponse(rs)
        );

        return results.isEmpty() ? null : results.get(0);
    }

    // Tìm hóa đơn theo ID đơn hàng
    public InvoiceResponse findByOrderId(Integer orderId) {

        String sql = """
            SELECT
                i.invoice_id,
                i.invoice_code,
                i.order_id,
                o.order_code,
                u.username,
                i.invoice_status,
                i.subtotal,
                i.discount_amount,
                i.tax_amount,
                i.total_amount,
                i.issued_at,
                i.created_at
            FROM invoices i
            INNER JOIN orders o ON i.order_id = o.order_id
            INNER JOIN users u ON o.user_id = u.user_id
            WHERE i.order_id = :orderId
            """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("orderId", orderId);

        List<InvoiceResponse> results = connection.query(
                sql,
                params,
                (rs, rowNum) -> mapInvoiceResponse(rs)
        );

        return results.isEmpty() ? null : results.get(0);
    }

    // Kiểm tra đơn hàng đã có hóa đơn hay chưa
    public boolean existsByOrderId(Integer orderId) {

        String sql = """
            SELECT COUNT(*)
            FROM invoices
            WHERE order_id = :orderId
            """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("orderId", orderId);

        Integer count = connection.queryForObject(
                sql,
                params,
                Integer.class
        );

        return count != null && count > 0;
    }

    // Tạo hóa đơn
    public Integer insert(Invoice invoice) {

        String sql = """
            INSERT INTO invoices (
                invoice_code,
                order_id,
                invoice_status,
                subtotal,
                discount_amount,
                tax_amount,
                total_amount,
                issued_at
            )
            OUTPUT INSERTED.invoice_id
            VALUES (
                :invoiceCode,
                :orderId,
                :invoiceStatus,
                :subtotal,
                :discountAmount,
                :taxAmount,
                :totalAmount,
                SYSDATETIME()
            )
            """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("invoiceCode", invoice.getInvoiceCode())
                .addValue("orderId", invoice.getOrderId())
                .addValue("invoiceStatus", invoice.getInvoiceStatus())
                .addValue("subtotal", invoice.getSubtotal())
                .addValue("discountAmount", invoice.getDiscountAmount())
                .addValue("taxAmount", invoice.getTaxAmount())
                .addValue("totalAmount", invoice.getTotalAmount());

        return connection.queryForObject(sql, params, Integer.class);
    }

    // Chuyển dữ liệu ResultSet thành InvoiceResponse
    private InvoiceResponse mapInvoiceResponse(ResultSet rs)
            throws SQLException {

        InvoiceResponse response = new InvoiceResponse();

        response.setInvoiceId(rs.getInt("invoice_id"));
        response.setInvoiceCode(rs.getString("invoice_code"));

        response.setOrderId(rs.getInt("order_id"));
        response.setOrderCode(rs.getString("order_code"));
        response.setUsername(rs.getString("username"));

        response.setInvoiceStatus(rs.getString("invoice_status"));

        response.setSubtotal(rs.getBigDecimal("subtotal"));
        response.setDiscountAmount(rs.getBigDecimal("discount_amount"));
        response.setTaxAmount(rs.getBigDecimal("tax_amount"));
        response.setTotalAmount(rs.getBigDecimal("total_amount"));

        response.setIssuedAt(
                rs.getTimestamp("issued_at") != null
                        ? rs.getTimestamp("issued_at").toLocalDateTime()
                        : null
        );

        response.setCreatedAt(
                rs.getTimestamp("created_at").toLocalDateTime()
        );

        return response;
    }
}
