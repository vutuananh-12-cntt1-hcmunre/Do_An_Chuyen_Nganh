
package com.example.restaurant_management.repository;

import java.util.List;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.restaurant_management.dto.KitchenOrderItemResponse;

@Repository
public class KitchenRepository {

    private final NamedParameterJdbcTemplate connection;

    public KitchenRepository(NamedParameterJdbcTemplate connection) {
        this.connection = connection;
    }

    // RowMapper dùng chung cho danh sách món bếp
    private KitchenOrderItemResponse mapKitchenOrderItem(
            java.sql.ResultSet rs,
            int rowNum
    ) throws java.sql.SQLException {

        return new KitchenOrderItemResponse(
                rs.getInt("order_item_id"),
                rs.getInt("order_id"),
                rs.getString("order_code"),
                rs.getString("order_type"),
                rs.getString("table_code"),
                rs.getString("dish_name"),
                rs.getInt("quantity"),
                rs.getString("item_note"),
                rs.getString("item_status"),
                rs.getTimestamp("sent_to_kitchen_at") != null
                        ? rs.getTimestamp("sent_to_kitchen_at").toLocalDateTime()
                        : null,
                rs.getTimestamp("completed_at") != null
                        ? rs.getTimestamp("completed_at").toLocalDateTime()
                        : null
        );
    }

    // Lấy danh sách món đang chờ hoặc đang chế biến
    // Chỉ hiển thị đơn đã xác nhận hoặc đang chế biến
    public List<KitchenOrderItemResponse> findPendingKitchenItems() {

        String sql = """
            SELECT
                oi.order_item_id,
                o.order_id,
                o.order_code,
                o.order_type,
                rt.table_code,
                d.dish_name,
                oi.quantity,
                oi.item_note,
                oi.item_status,
                oi.sent_to_kitchen_at,
                oi.completed_at
            FROM order_items oi
            INNER JOIN orders o
                ON oi.order_id = o.order_id
            INNER JOIN dishes d
                ON oi.dish_id = d.dish_id
            LEFT JOIN restaurant_tables rt
                ON o.table_id = rt.table_id
            WHERE oi.item_status IN ('PENDING', 'PREPARING')
              AND o.order_status IN ('CONFIRMED', 'PREPARING')
            ORDER BY o.created_at ASC, oi.order_item_id ASC
            """;

        return connection.query(
                sql,
                new MapSqlParameterSource(),
                this::mapKitchenOrderItem
        );
    }

    // Lấy trạng thái hiện tại của món ăn
    public String findItemStatusById(Integer orderItemId) {

        String sql = """
            SELECT item_status
            FROM order_items
            WHERE order_item_id = :orderItemId
            """;

        List<String> results = connection.query(
                sql,
                new MapSqlParameterSource("orderItemId", orderItemId),
                (rs, rowNum) -> rs.getString("item_status")
        );

        return results.isEmpty() ? null : results.get(0);
    }

    // Lấy order_id từ order_item_id
    public Integer findOrderIdByItemId(Integer orderItemId) {

        String sql = """
            SELECT order_id
            FROM order_items
            WHERE order_item_id = :orderItemId
            """;

        List<Integer> results = connection.query(
                sql,
                new MapSqlParameterSource("orderItemId", orderItemId),
                (rs, rowNum) -> rs.getInt("order_id")
        );

        return results.isEmpty() ? null : results.get(0);
    }

    // Kiểm tra đơn hàng còn món chưa hoàn thành hay không
    public boolean existsUncompletedItemsByOrderId(Integer orderId) {

        String sql = """
            SELECT COUNT(*)
            FROM order_items
            WHERE order_id = :orderId
              AND item_status <> 'COMPLETED'
            """;

        Integer count = connection.queryForObject(
                sql,
                new MapSqlParameterSource("orderId", orderId),
                Integer.class
        );

        return count != null && count > 0;
    }

    // Cập nhật trạng thái món ăn
    public int updateItemStatus(
            Integer orderItemId,
            String currentStatus,
            String newStatus
    ) {

        String sql = """
            UPDATE order_items
            SET
                item_status = :newStatus,
                sent_to_kitchen_at = CASE
                    WHEN :newStatus = 'PREPARING'
                    THEN SYSDATETIME()
                    ELSE sent_to_kitchen_at
                END,
                completed_at = CASE
                    WHEN :newStatus = 'COMPLETED'
                    THEN SYSDATETIME()
                    ELSE completed_at
                END
            WHERE order_item_id = :orderItemId
              AND item_status = :currentStatus
            """;

        MapSqlParameterSource parameters = new MapSqlParameterSource()
                .addValue("orderItemId", orderItemId)
                .addValue("currentStatus", currentStatus)
                .addValue("newStatus", newStatus);

        return connection.update(sql, parameters);
    }

    // Lấy danh sách tối đa 100 món đã hoàn thành
    public List<KitchenOrderItemResponse> findCompletedKitchenItems() {

        String sql = """
            SELECT TOP 100
                oi.order_item_id,
                o.order_id,
                o.order_code,
                o.order_type,
                rt.table_code,
                d.dish_name,
                oi.quantity,
                oi.item_note,
                oi.item_status,
                oi.sent_to_kitchen_at,
                oi.completed_at
            FROM order_items oi
            INNER JOIN orders o
                ON oi.order_id = o.order_id
            INNER JOIN dishes d
                ON oi.dish_id = d.dish_id
            LEFT JOIN restaurant_tables rt
                ON o.table_id = rt.table_id
            WHERE oi.item_status = 'COMPLETED'
              AND o.order_status <> 'CANCELLED'
            ORDER BY oi.completed_at DESC, oi.order_item_id DESC
            """;

        return connection.query(
                sql,
                new MapSqlParameterSource(),
                this::mapKitchenOrderItem
        );
    }
}
