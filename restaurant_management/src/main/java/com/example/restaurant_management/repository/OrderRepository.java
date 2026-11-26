
package com.example.restaurant_management.repository;

import java.util.List;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.restaurant_management.dto.Order;
import com.example.restaurant_management.dto.OrderItem;

@Repository
public class OrderRepository {

    private final NamedParameterJdbcTemplate connection;

    public OrderRepository(NamedParameterJdbcTemplate connection) {
        this.connection = connection;
    }

    private final RowMapper<Order> orderRowMapper = (rs, rowNum) -> {
        Order order = new Order();

        order.setOrderId(rs.getInt("order_id"));
        order.setOrderCode(rs.getString("order_code"));
        order.setUserId(rs.getInt("user_id"));

        int tableId = rs.getInt("table_id");
        order.setTableId(rs.wasNull() ? null : tableId);

        order.setOrderType(rs.getString("order_type"));
        order.setOrderStatus(rs.getString("order_status"));
        order.setDeliveryAddress(rs.getString("delivery_address"));
        order.setCustomerNote(rs.getString("customer_note"));

        order.setSubtotal(rs.getBigDecimal("subtotal"));
        order.setDiscountAmount(rs.getBigDecimal("discount_amount"));
        order.setDeliveryFee(rs.getBigDecimal("delivery_fee"));
        order.setTotalAmount(rs.getBigDecimal("total_amount"));

        if (rs.getTimestamp("created_at") != null) {
            order.setCreatedAt(
                rs.getTimestamp("created_at").toLocalDateTime()
            );
        }

        if (rs.getTimestamp("updated_at") != null) {
            order.setUpdatedAt(
                rs.getTimestamp("updated_at").toLocalDateTime()
            );
        }

        return order;
    };

    private final RowMapper<OrderItem> orderItemRowMapper = (rs, rowNum) -> {
        OrderItem item = new OrderItem();

        item.setOrderItemId(rs.getInt("order_item_id"));
        item.setOrderId(rs.getInt("order_id"));
        item.setDishId(rs.getInt("dish_id"));
        item.setDishName(rs.getString("dish_name"));
        item.setQuantity(rs.getInt("quantity"));
        item.setUnitPrice(rs.getBigDecimal("unit_price"));
        item.setSubtotal(rs.getBigDecimal("subtotal"));
        item.setItemNote(rs.getString("item_note"));
        item.setItemStatus(rs.getString("item_status"));

        if (rs.getTimestamp("sent_to_kitchen_at") != null) {
            item.setSentToKitchenAt(
                rs.getTimestamp("sent_to_kitchen_at").toLocalDateTime()
            );
        }

        if (rs.getTimestamp("completed_at") != null) {
            item.setCompletedAt(
                rs.getTimestamp("completed_at").toLocalDateTime()
            );
        }

        return item;
    };

    public List<Order> findAll() {
        String sql = """
            SELECT
                order_id,
                order_code,
                user_id,
                table_id,
                order_type,
                order_status,
                delivery_address,
                customer_note,
                subtotal,
                discount_amount,
                delivery_fee,
                total_amount,
                created_at,
                updated_at
            FROM orders
            ORDER BY created_at DESC
            """;

        return connection.query(sql, orderRowMapper);
    }

    public Order findById(Integer orderId) {
        String sql = """
            SELECT
                order_id,
                order_code,
                user_id,
                table_id,
                order_type,
                order_status,
                delivery_address,
                customer_note,
                subtotal,
                discount_amount,
                delivery_fee,
                total_amount,
                created_at,
                updated_at
            FROM orders
            WHERE order_id = :orderId
            """;

        MapSqlParameterSource params =
            new MapSqlParameterSource("orderId", orderId);

        List<Order> orders = connection.query(
            sql,
            params,
            orderRowMapper
        );

        return orders.isEmpty() ? null : orders.get(0);
    }

    public List<Order> findByUserId(Integer userId) {
        String sql = """
            SELECT
                order_id,
                order_code,
                user_id,
                table_id,
                order_type,
                order_status,
                delivery_address,
                customer_note,
                subtotal,
                discount_amount,
                delivery_fee,
                total_amount,
                created_at,
                updated_at
            FROM orders
            WHERE user_id = :userId
            ORDER BY created_at DESC
            """;

        MapSqlParameterSource params =
            new MapSqlParameterSource("userId", userId);

        return connection.query(sql, params, orderRowMapper);
    }

    public boolean existsById(Integer orderId) {
        String sql = """
            SELECT COUNT(*)
            FROM orders
            WHERE order_id = :orderId
            """;

        Integer count = connection.queryForObject(
            sql,
            new MapSqlParameterSource("orderId", orderId),
            Integer.class
        );

        return count != null && count > 0;
    }

    public List<OrderItem> findItemsByOrderId(Integer orderId) {
        String sql = """
            SELECT
                oi.order_item_id,
                oi.order_id,
                oi.dish_id,
                d.dish_name,
                oi.quantity,
                oi.unit_price,
                oi.subtotal,
                oi.item_note,
                oi.item_status,
                oi.sent_to_kitchen_at,
                oi.completed_at
            FROM order_items oi
            INNER JOIN dishes d
                ON oi.dish_id = d.dish_id
            WHERE oi.order_id = :orderId
            ORDER BY oi.order_item_id ASC
            """;

        MapSqlParameterSource params =
            new MapSqlParameterSource("orderId", orderId);

        return connection.query(sql, params, orderItemRowMapper);
    }

    public Integer insert(Order order) {
        String sql = """
            INSERT INTO orders (
                order_code,
                user_id,
                table_id,
                order_type,
                order_status,
                delivery_address,
                customer_note,
                subtotal,
                discount_amount,
                delivery_fee,
                total_amount,
                created_at,
                updated_at
            )
            OUTPUT INSERTED.order_id
            VALUES (
                :orderCode,
                :userId,
                :tableId,
                :orderType,
                :orderStatus,
                :deliveryAddress,
                :customerNote,
                :subtotal,
                :discountAmount,
                :deliveryFee,
                :totalAmount,
                SYSDATETIME(),
                SYSDATETIME()
            )
            """;

        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("orderCode", order.getOrderCode())
            .addValue("userId", order.getUserId())
            .addValue("tableId", order.getTableId())
            .addValue("orderType", order.getOrderType())
            .addValue("orderStatus", order.getOrderStatus())
            .addValue("deliveryAddress", order.getDeliveryAddress())
            .addValue("customerNote", order.getCustomerNote())
            .addValue("subtotal", order.getSubtotal())
            .addValue("discountAmount", order.getDiscountAmount())
            .addValue("deliveryFee", order.getDeliveryFee())
            .addValue("totalAmount", order.getTotalAmount());

        return connection.queryForObject(
            sql,
            params,
            Integer.class
        );
    }

    public int insertItem(OrderItem item) {
        String sql = """
            INSERT INTO order_items (
                order_id,
                dish_id,
                quantity,
                unit_price,
                subtotal,
                item_note,
                item_status
            )
            VALUES (
                :orderId,
                :dishId,
                :quantity,
                :unitPrice,
                :subtotal,
                :itemNote,
                :itemStatus
            )
            """;

        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("orderId", item.getOrderId())
            .addValue("dishId", item.getDishId())
            .addValue("quantity", item.getQuantity())
            .addValue("unitPrice", item.getUnitPrice())
            .addValue("subtotal", item.getSubtotal())
            .addValue("itemNote", item.getItemNote())
            .addValue("itemStatus", item.getItemStatus());

        return connection.update(sql, params);
    }

    // Lưu khuyến mãi đã áp dụng cho đơn hàng
    public int insertOrderPromotion(
            Integer orderId,
            Integer promotionId,
            java.math.BigDecimal discountAmount) {

        String sql = """
            INSERT INTO order_promotions (
                order_id,
                promotion_id,
                discount_amount,
                applied_at
            )
            VALUES (
                :orderId,
                :promotionId,
                :discountAmount,
                SYSDATETIME()
            )
            """;

        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("orderId", orderId)
            .addValue("promotionId", promotionId)
            .addValue("discountAmount", discountAmount);

        return connection.update(sql, params);
    }

    public int updateStatus(Integer orderId, String orderStatus) {
        String sql = """
            UPDATE orders
            SET
                order_status = :orderStatus,
                updated_at = SYSDATETIME()
            WHERE order_id = :orderId
            """;

        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("orderId", orderId)
            .addValue("orderStatus", orderStatus);

        return connection.update(sql, params);
    }
}
