package com.example.restaurant_management.repository;

import java.time.LocalDate;
import java.util.List;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.restaurant_management.dto.DailyRevenueResponse;
import com.example.restaurant_management.dto.StatisticsOverviewResponse;
import com.example.restaurant_management.dto.TopSellingDishResponse;

@Repository
public class StatisticsRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public StatisticsRepository(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Thống kê tổng quan
    public StatisticsOverviewResponse getOverview() {

        String sql = """
            SELECT
                COUNT(*) AS total_orders,
                SUM(CASE
                    WHEN order_status = 'COMPLETED' THEN 1
                    ELSE 0
                END) AS completed_orders,
                COALESCE(SUM(CASE
                    WHEN order_status = 'COMPLETED' THEN total_amount
                    ELSE 0
                END), 0) AS total_revenue
            FROM orders
            """;

        return jdbcTemplate.queryForObject(
            sql,
            new MapSqlParameterSource(),
            (rs, rowNum) -> new StatisticsOverviewResponse(
                rs.getLong("total_orders"),
                rs.getLong("completed_orders"),
                rs.getBigDecimal("total_revenue")
            )
        );
    }

    // Thống kê doanh thu theo ngày
    public List<DailyRevenueResponse> getDailyRevenue(
            LocalDate fromDate, LocalDate toDate) {

        String sql = """
            SELECT
                CAST(created_at AS DATE) AS revenue_date,
                SUM(total_amount) AS revenue
            FROM orders
            WHERE order_status = 'COMPLETED'
              AND created_at >= :fromDate
              AND created_at < DATEADD(DAY, 1, :toDate)
            GROUP BY CAST(created_at AS DATE)
            ORDER BY revenue_date
            """;

        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("fromDate", fromDate)
            .addValue("toDate", toDate);

        return jdbcTemplate.query(sql, params, (rs, rowNum) ->
            new DailyRevenueResponse(
                rs.getDate("revenue_date").toLocalDate(),
                rs.getBigDecimal("revenue")
            )
        );
    }

    // Top món ăn bán chạy
    public List<TopSellingDishResponse> getTopSellingDishes(int limit) {

        String sql = """
            SELECT TOP (:limit)
                d.dish_id,
                d.dish_name,
                SUM(oi.quantity) AS total_sold
            FROM orders o
            INNER JOIN order_items oi
                ON o.order_id = oi.order_id
            INNER JOIN dishes d
                ON oi.dish_id = d.dish_id
            WHERE o.order_status = 'COMPLETED'
            GROUP BY d.dish_id, d.dish_name
            ORDER BY SUM(oi.quantity) DESC
            """;

        MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("limit", limit);

        return jdbcTemplate.query(sql, params, (rs, rowNum) ->
            new TopSellingDishResponse(
                rs.getInt("dish_id"),
                rs.getString("dish_name"),
                rs.getLong("total_sold")
            )
        );
    }
}