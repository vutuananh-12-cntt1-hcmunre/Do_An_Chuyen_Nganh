
package com.example.restaurant_management.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.example.restaurant_management.dto.Delivery;
import com.example.restaurant_management.dto.DeliveryResponse;

@Repository
public class DeliveryRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public DeliveryRepository(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final String SELECT_DELIVERY = """
            SELECT
                d.delivery_id,
                d.order_id,
                o.order_code,
                o.delivery_address AS delivery_address,
                d.employee_id,
                u.full_name AS employee_name,
                d.delivery_status,
                d.assigned_at,
                d.picked_up_at,
                d.delivered_at,
                d.delivery_note,
                d.created_at,
                d.updated_at
            FROM deliveries d
            INNER JOIN orders o
                ON d.order_id = o.order_id
            LEFT JOIN employees e
                ON d.employee_id = e.employee_id
            LEFT JOIN users u
                ON e.user_id = u.user_id
            """;

    private DeliveryResponse mapRow(
            java.sql.ResultSet rs,
            int rowNum) throws java.sql.SQLException {

        return new DeliveryResponse(
                rs.getInt("delivery_id"),
                rs.getInt("order_id"),
                rs.getString("order_code"),
                rs.getString("delivery_address"),
                rs.getObject("employee_id") == null
                        ? null : rs.getInt("employee_id"),
                rs.getString("employee_name"),
                rs.getString("delivery_status"),
                rs.getTimestamp("assigned_at") == null
                        ? null : rs.getTimestamp("assigned_at").toLocalDateTime(),
                rs.getTimestamp("picked_up_at") == null
                        ? null : rs.getTimestamp("picked_up_at").toLocalDateTime(),
                rs.getTimestamp("delivered_at") == null
                        ? null : rs.getTimestamp("delivered_at").toLocalDateTime(),
                rs.getString("delivery_note"),
                rs.getTimestamp("created_at").toLocalDateTime(),
                rs.getTimestamp("updated_at").toLocalDateTime()
        );
    }

    // Lấy danh sách giao hàng
    public List<DeliveryResponse> findAll() {

        String sql = SELECT_DELIVERY
                + " ORDER BY d.created_at DESC";

        return jdbcTemplate.query(sql, this::mapRow);
    }

    // Tìm thông tin giao hàng theo ID
    public Optional<DeliveryResponse> findById(Integer deliveryId) {

        String sql = SELECT_DELIVERY
                + " WHERE d.delivery_id = :deliveryId";

        Map<String, Object> params = Map.of(
                "deliveryId", deliveryId
        );

        List<DeliveryResponse> results = jdbcTemplate.query(
                sql,
                params,
                this::mapRow
        );

        return results.stream().findFirst();
    }

    // Kiểm tra đơn hàng đã có phiếu giao hàng chưa
    public boolean existsByOrderId(Integer orderId) {

        String sql = """
                SELECT COUNT(*)
                FROM deliveries
                WHERE order_id = :orderId
                """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Map.of("orderId", orderId),
                Integer.class
        );

        return count != null && count > 0;
    }

    // Kiểm tra đơn hàng có phải đơn giao tận nơi không
    public boolean existsDeliveryOrder(Integer orderId) {

        String sql = """
                SELECT COUNT(*)
                FROM orders
                WHERE order_id = :orderId
                  AND order_type = 'DELIVERY'
                """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Map.of("orderId", orderId),
                Integer.class
        );

        return count != null && count > 0;
    }

    // Kiểm tra nhân viên đang hoạt động
    public boolean existsActiveEmployee(Integer employeeId) {

        String sql = """
                SELECT COUNT(*)
                FROM employees
                WHERE employee_id = :employeeId
                  AND employee_status = 'ACTIVE'
                """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Map.of("employeeId", employeeId),
                Integer.class
        );

        return count != null && count > 0;
    }

    // Kiểm tra nhân viên tồn tại
    public boolean existsEmployee(Integer employeeId) {

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

    // Tìm employee_id theo username đang đăng nhập
    public Optional<Integer> findEmployeeIdByUsername(String username) {

        String sql = """
                SELECT e.employee_id
                FROM employees e
                INNER JOIN users u
                    ON e.user_id = u.user_id
                WHERE u.username = :username
                  AND e.employee_status = 'ACTIVE'
                """;

        List<Integer> results = jdbcTemplate.query(
                sql,
                Map.of("username", username),
                (rs, rowNum) -> rs.getInt("employee_id")
        );

        return results.stream().findFirst();
    }

    // Tạo phiếu giao hàng
    public Integer insert(Delivery delivery) {

        String sql = """
                INSERT INTO deliveries (
                    order_id,
                    employee_id,
                    delivery_status,
                    assigned_at,
                    delivery_note
                )
                VALUES (
                    :orderId,
                    :employeeId,
                    :deliveryStatus,
                    :assignedAt,
                    :deliveryNote
                )
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("orderId", delivery.getOrderId())
                .addValue("employeeId", delivery.getEmployeeId())
                .addValue("deliveryStatus", delivery.getDeliveryStatus())
                .addValue("assignedAt", delivery.getAssignedAt())
                .addValue("deliveryNote", delivery.getDeliveryNote());

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(
                sql,
                params,
                keyHolder,
                new String[]{"delivery_id"}
        );

        return keyHolder.getKey().intValue();
    }

    // Phân công nhân viên giao hàng
    public boolean assignEmployee(
            Integer deliveryId,
            Integer employeeId) {

        String sql = """
                UPDATE deliveries
                SET employee_id = :employeeId,
                    delivery_status = 'ASSIGNED',
                    assigned_at = SYSDATETIME(),
                    updated_at = SYSDATETIME()
                WHERE delivery_id = :deliveryId
                  AND delivery_status = 'PENDING'
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("deliveryId", deliveryId)
                .addValue("employeeId", employeeId);

        return jdbcTemplate.update(sql, params) > 0;
    }

    // Cập nhật trạng thái giao hàng
    public boolean updateStatus(
            Integer deliveryId,
            String deliveryStatus) {

        String sql = """
                UPDATE deliveries
                SET delivery_status = :deliveryStatus,
                    picked_up_at = CASE
                        WHEN :deliveryStatus = 'PICKED_UP'
                        THEN COALESCE(picked_up_at, SYSDATETIME())
                        ELSE picked_up_at
                    END,
                    delivered_at = CASE
                        WHEN :deliveryStatus = 'DELIVERED'
                        THEN SYSDATETIME()
                        ELSE delivered_at
                    END,
                    updated_at = SYSDATETIME()
                WHERE delivery_id = :deliveryId
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("deliveryId", deliveryId)
                .addValue("deliveryStatus", deliveryStatus);

        return jdbcTemplate.update(sql, params) > 0;
    }

    // Cập nhật ghi chú giao hàng
    public boolean updateNote(
            Integer deliveryId,
            String deliveryNote) {

        String sql = """
                UPDATE deliveries
                SET delivery_note = :deliveryNote,
                    updated_at = SYSDATETIME()
                WHERE delivery_id = :deliveryId
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("deliveryId", deliveryId)
                .addValue("deliveryNote", deliveryNote);

        return jdbcTemplate.update(sql, params) > 0;
    }

    // Lấy danh sách giao hàng theo nhân viên được phân công
    public List<DeliveryResponse> findByEmployeeId(Integer employeeId) {

        String sql = SELECT_DELIVERY
                + """
                  WHERE d.employee_id = :employeeId
                  ORDER BY d.created_at DESC
                  """;

        Map<String, Object> params = Map.of(
                "employeeId", employeeId
        );

        return jdbcTemplate.query(
                sql,
                params,
                this::mapRow
        );
    }
}
