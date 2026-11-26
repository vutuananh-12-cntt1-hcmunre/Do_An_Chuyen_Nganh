
package com.example.restaurant_management.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.restaurant_management.dto.Payment;
import com.example.restaurant_management.dto.PaymentResponse;

@Repository
public class PaymentRepository {

    private final NamedParameterJdbcTemplate connection;

    public PaymentRepository(NamedParameterJdbcTemplate connection) {
        this.connection = connection;
    }

    // Ánh xạ dữ liệu SQL Server sang PaymentResponse
    private PaymentResponse mapPaymentResponse(
            ResultSet rs
    ) throws SQLException {

        PaymentResponse response = new PaymentResponse();

        response.setPaymentId(rs.getInt("payment_id"));
        response.setOrderId(rs.getInt("order_id"));
        response.setOrderCode(rs.getString("order_code"));
        response.setUsername(rs.getString("username"));
        response.setPaymentMethod(rs.getString("payment_method"));
        response.setPaymentStatus(rs.getString("payment_status"));
        response.setAmount(rs.getBigDecimal("amount"));
        response.setTransactionCode(rs.getString("transaction_code"));

        response.setPaidAt(
                rs.getTimestamp("paid_at") != null
                        ? rs.getTimestamp("paid_at").toLocalDateTime()
                        : null
        );

        response.setCreatedAt(
                rs.getTimestamp("created_at") != null
                        ? rs.getTimestamp("created_at").toLocalDateTime()
                        : null
        );

        return response;
    }

    // Lấy danh sách tất cả thanh toán
    public List<PaymentResponse> findAll() {

        String sql = """
            SELECT
                p.payment_id,
                p.order_id,
                o.order_code,
                u.username,
                p.payment_method,
                p.payment_status,
                p.amount,
                p.transaction_code,
                p.paid_at,
                p.created_at
            FROM payments p
            INNER JOIN orders o
                ON p.order_id = o.order_id
            INNER JOIN users u
                ON o.user_id = u.user_id
            ORDER BY p.created_at DESC
            """;

        return connection.query(
                sql,
                new MapSqlParameterSource(),
                (rs, rowNum) -> mapPaymentResponse(rs)
        );
    }

    // Lấy thông tin thanh toán theo ID
    public PaymentResponse findById(Integer paymentId) {

        String sql = """
            SELECT
                p.payment_id,
                p.order_id,
                o.order_code,
                u.username,
                p.payment_method,
                p.payment_status,
                p.amount,
                p.transaction_code,
                p.paid_at,
                p.created_at
            FROM payments p
            INNER JOIN orders o
                ON p.order_id = o.order_id
            INNER JOIN users u
                ON o.user_id = u.user_id
            WHERE p.payment_id = :paymentId
            """;

        List<PaymentResponse> results = connection.query(
                sql,
                new MapSqlParameterSource("paymentId", paymentId),
                (rs, rowNum) -> mapPaymentResponse(rs)
        );

        return results.isEmpty() ? null : results.get(0);
    }

    // Lấy danh sách thanh toán theo đơn hàng
    public List<PaymentResponse> findByOrderId(Integer orderId) {

        String sql = """
            SELECT
                p.payment_id,
                p.order_id,
                o.order_code,
                u.username,
                p.payment_method,
                p.payment_status,
                p.amount,
                p.transaction_code,
                p.paid_at,
                p.created_at
            FROM payments p
            INNER JOIN orders o
                ON p.order_id = o.order_id
            INNER JOIN users u
                ON o.user_id = u.user_id
            WHERE p.order_id = :orderId
            ORDER BY p.created_at DESC
            """;

        return connection.query(
                sql,
                new MapSqlParameterSource("orderId", orderId),
                (rs, rowNum) -> mapPaymentResponse(rs)
        );
    }

    // Lấy đối tượng Payment theo ID
    public Payment findPaymentById(Integer paymentId) {

        String sql = """
            SELECT *
            FROM payments
            WHERE payment_id = :paymentId
            """;

        List<Payment> results = connection.query(
                sql,
                new MapSqlParameterSource("paymentId", paymentId),
                (rs, rowNum) -> new Payment(
                        rs.getInt("payment_id"),
                        rs.getInt("order_id"),
                        rs.getString("payment_method"),
                        rs.getString("payment_status"),
                        rs.getBigDecimal("amount"),
                        rs.getString("transaction_code"),
                        rs.getTimestamp("paid_at") != null
                                ? rs.getTimestamp("paid_at").toLocalDateTime()
                                : null,
                        rs.getTimestamp("created_at").toLocalDateTime()
                )
        );

        return results.isEmpty() ? null : results.get(0);
    }

    // Kiểm tra đơn hàng đã thanh toán thành công chưa
    public boolean hasSuccessfulPayment(Integer orderId) {

        String sql = """
            SELECT COUNT(*)
            FROM payments
            WHERE order_id = :orderId
              AND payment_status = 'SUCCESS'
            """;

        Integer count = connection.queryForObject(
                sql,
                new MapSqlParameterSource("orderId", orderId),
                Integer.class
        );

        return count != null && count > 0;
    }

    // Thêm thanh toán mới
    public Integer insert(Payment payment) {

        String sql = """
            INSERT INTO payments (
                order_id,
                payment_method,
                payment_status,
                amount,
                transaction_code
            )
            OUTPUT INSERTED.payment_id
            VALUES (
                :orderId,
                :paymentMethod,
                :paymentStatus,
                :amount,
                :transactionCode
            )
            """;

        MapSqlParameterSource parameters = new MapSqlParameterSource()
                .addValue("orderId", payment.getOrderId())
                .addValue("paymentMethod", payment.getPaymentMethod())
                .addValue("paymentStatus", payment.getPaymentStatus())
                .addValue("amount", payment.getAmount())
                .addValue("transactionCode", payment.getTransactionCode());

        return connection.queryForObject(
                sql,
                parameters,
                Integer.class
        );
    }

    // Cập nhật trạng thái thanh toán
    public int updateStatus(
            Integer paymentId,
            String currentStatus,
            String newStatus,
            String transactionCode
    ) {

        String sql = """
            UPDATE payments
            SET
                payment_status = :newStatus,
                transaction_code = COALESCE(
                    :transactionCode,
                    transaction_code
                ),
                paid_at = CASE
                    WHEN :newStatus = 'SUCCESS'
                    THEN SYSDATETIME()
                    ELSE paid_at
                END
            WHERE payment_id = :paymentId
              AND payment_status = :currentStatus
            """;

        MapSqlParameterSource parameters = new MapSqlParameterSource()
                .addValue("paymentId", paymentId)
                .addValue("currentStatus", currentStatus)
                .addValue("newStatus", newStatus)
                .addValue("transactionCode", transactionCode);

        return connection.update(sql, parameters);
    }
    // Tìm thanh toán BANK_TRANSFER đang chờ theo mã đơn hàng
public Payment findPendingBankTransferByOrderCode(String orderCode) {

    String sql = """
        SELECT TOP 1
            p.payment_id,
            p.order_id,
            p.payment_method,
            p.payment_status,
            p.amount,
            p.transaction_code,
            p.paid_at,
            p.created_at
        FROM payments p
        INNER JOIN orders o ON p.order_id = o.order_id
        WHERE o.order_code = :orderCode
          AND p.payment_method = 'BANK_TRANSFER'
          AND p.payment_status = 'PENDING'
        ORDER BY p.created_at DESC
        """;

    return connection.query(
        sql,
        Map.of("orderCode", orderCode),
        (rs, rowNum) -> {
            Payment payment = new Payment();

            payment.setPaymentId(rs.getInt("payment_id"));
            payment.setOrderId(rs.getInt("order_id"));
            payment.setPaymentMethod(rs.getString("payment_method"));
            payment.setPaymentStatus(rs.getString("payment_status"));
            payment.setAmount(rs.getBigDecimal("amount"));
            payment.setTransactionCode(rs.getString("transaction_code"));
            payment.setPaidAt(
                rs.getTimestamp("paid_at") == null
                    ? null
                    : rs.getTimestamp("paid_at").toLocalDateTime()
            );
            payment.setCreatedAt(
                rs.getTimestamp("created_at") == null
                    ? null
                    : rs.getTimestamp("created_at").toLocalDateTime()
            );

            return payment;
        }
    ).stream().findFirst().orElse(null);
}
// Kiểm tra mã giao dịch đã được sử dụng chưa
public boolean existsByTransactionCode(String transactionCode) {

    String sql = """
        SELECT COUNT(*)
        FROM payments
        WHERE transaction_code = :transactionCode
        """;

    Integer count = connection.queryForObject(
        sql,
        Map.of("transactionCode", transactionCode),
        Integer.class
    );

    return count != null && count > 0;
}
}
