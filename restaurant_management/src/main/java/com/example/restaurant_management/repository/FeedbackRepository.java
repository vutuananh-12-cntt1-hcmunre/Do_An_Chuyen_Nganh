
package com.example.restaurant_management.repository;

import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.example.restaurant_management.dto.Feedback;
import com.example.restaurant_management.dto.FeedbackRequest;
import com.example.restaurant_management.dto.FeedbackResponse;
import com.example.restaurant_management.dto.FeedbackStatisticsResponse;

@Repository
public class FeedbackRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public FeedbackRepository(
            NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<Feedback> feedbackRowMapper =
            (rs, rowNum) -> {
                Feedback feedback = new Feedback();

                feedback.setFeedbackId(rs.getInt("feedback_id"));
                feedback.setUserId(rs.getInt("user_id"));

                int orderId = rs.getInt("order_id");
                feedback.setOrderId(rs.wasNull() ? null : orderId);

                int dishId = rs.getInt("dish_id");
                feedback.setDishId(rs.wasNull() ? null : dishId);

                int rating = rs.getInt("rating");
                feedback.setRating(rs.wasNull() ? null : rating);

                feedback.setContent(rs.getString("content"));
                feedback.setFeedbackStatus(
                        rs.getString("feedback_status")
                );

                return feedback;
            };

    // =====================================================
    // KIỂM TRA NGHIỆP VỤ ĐÁNH GIÁ
    // =====================================================

    // Kiểm tra đơn hàng thuộc khách hàng và đã hoàn thành
    public boolean isCompletedOrderOwnedByUser(
            Integer orderId,
            Integer userId) {

        String sql = """
            SELECT COUNT(*)
            FROM orders
            WHERE order_id = :orderId
              AND user_id = :userId
              AND order_status = 'COMPLETED'
            """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                new MapSqlParameterSource()
                        .addValue("orderId", orderId)
                        .addValue("userId", userId),
                Integer.class
        );

        return count != null && count > 0;
    }

    // Kiểm tra món ăn có thuộc đơn hàng không
    public boolean existsDishInOrder(
            Integer orderId,
            Integer dishId) {

        String sql = """
            SELECT COUNT(*)
            FROM order_items
            WHERE order_id = :orderId
              AND dish_id = :dishId
            """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                new MapSqlParameterSource()
                        .addValue("orderId", orderId)
                        .addValue("dishId", dishId),
                Integer.class
        );

        return count != null && count > 0;
    }

    // Kiểm tra phản hồi đã tồn tại
    // dishId = null: đánh giá toàn bộ đơn hàng
    // dishId có giá trị: đánh giá một món ăn
    public boolean existsFeedback(
            Integer userId,
            Integer orderId,
            Integer dishId) {

        String sql;

        MapSqlParameterSource params =
                new MapSqlParameterSource()
                        .addValue("userId", userId)
                        .addValue("orderId", orderId);

        if (dishId == null) {
            sql = """
                SELECT COUNT(*)
                FROM feedbacks
                WHERE user_id = :userId
                  AND order_id = :orderId
                  AND dish_id IS NULL
                """;
        } else {
            sql = """
                SELECT COUNT(*)
                FROM feedbacks
                WHERE user_id = :userId
                  AND order_id = :orderId
                  AND dish_id = :dishId
                """;

            params.addValue("dishId", dishId);
        }

        Integer count = jdbcTemplate.queryForObject(
                sql,
                params,
                Integer.class
        );

        return count != null && count > 0;
    }

    // =====================================================
    // TẠO PHẢN HỒI
    // =====================================================

    public Integer create(
            Integer userId,
            FeedbackRequest request) {

        String sql = """
            INSERT INTO feedbacks (
                user_id,
                order_id,
                dish_id,
                rating,
                content
            )
            OUTPUT INSERTED.feedback_id
            VALUES (
                :userId,
                :orderId,
                :dishId,
                :rating,
                :content
            )
            """;

        MapSqlParameterSource params =
                new MapSqlParameterSource()
                        .addValue("userId", userId)
                        .addValue("orderId", request.getOrderId())
                        .addValue("dishId", request.getDishId())
                        .addValue("rating", request.getRating())
                        .addValue("content", request.getContent());

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(sql, params, keyHolder);

        Number key = keyHolder.getKey();

        return key != null ? key.intValue() : null;
    }

    // =====================================================
    // LẤY THÔNG TIN PHẢN HỒI
    // =====================================================

    public Feedback findById(Integer feedbackId) {

        String sql = """
            SELECT *
            FROM feedbacks
            WHERE feedback_id = :feedbackId
            """;

        return jdbcTemplate.query(
                sql,
                Map.of("feedbackId", feedbackId),
                feedbackRowMapper
        ).stream().findFirst().orElse(null);
    }

    public List<Feedback> findAll() {

        String sql = """
            SELECT *
            FROM feedbacks
            ORDER BY feedback_id DESC
            """;

        return jdbcTemplate.query(
                sql,
                Map.of(),
                feedbackRowMapper
        );
    }

    public Integer findUserIdByUsername(String username) {

        String sql = """
            SELECT user_id
            FROM users
            WHERE username = :username
            """;

        return jdbcTemplate.queryForObject(
                sql,
                new MapSqlParameterSource("username", username),
                Integer.class
        );
    }

    // =====================================================
    // ROW MAPPER CHO RESPONSE KÈM AI
    // =====================================================

    private final RowMapper<FeedbackResponse>
            feedbackResponseRowMapper = (rs, rowNum) -> {

        Timestamp analyzedTimestamp =
                rs.getTimestamp("analyzed_at");

        LocalDateTime analyzedAt =
                analyzedTimestamp == null
                        ? null
                        : analyzedTimestamp.toLocalDateTime();

        return new FeedbackResponse(
                rs.getInt("feedback_id"),
                rs.getInt("user_id"),
                rs.getObject("order_id", Integer.class),
                rs.getObject("dish_id", Integer.class),
                rs.getObject("rating", Integer.class),
                rs.getString("content"),
                rs.getString("feedback_status"),
                rs.getString("sentiment"),
                rs.getObject("confidence_score", Double.class),
                rs.getString("analysis_result"),
                rs.getString("model_name"),
                analyzedAt
        );
    };

    // =====================================================
    // LẤY PHẢN HỒI KÈM KẾT QUẢ AI
    // =====================================================

    public List<FeedbackResponse> findAllWithAnalysis() {

        String sql = """
            SELECT
                f.feedback_id,
                f.user_id,
                f.order_id,
                f.dish_id,
                f.rating,
                f.content,
                f.feedback_status,
                fa.sentiment,
                fa.confidence_score,
                fa.analysis_result,
                fa.model_name,
                fa.analyzed_at
            FROM feedbacks f
            OUTER APPLY (
                SELECT TOP 1
                    sentiment,
                    confidence_score,
                    analysis_result,
                    model_name,
                    analyzed_at
                FROM feedback_analysis
                WHERE feedback_id = f.feedback_id
                ORDER BY analyzed_at DESC, analysis_id DESC
            ) fa
            ORDER BY f.feedback_id DESC
            """;

        return jdbcTemplate.query(
                sql,
                Map.of(),
                feedbackResponseRowMapper
        );
    }

    public FeedbackResponse findByIdWithAnalysis(
            Integer feedbackId) {

        String sql = """
            SELECT
                f.feedback_id,
                f.user_id,
                f.order_id,
                f.dish_id,
                f.rating,
                f.content,
                f.feedback_status,
                fa.sentiment,
                fa.confidence_score,
                fa.analysis_result,
                fa.model_name,
                fa.analyzed_at
            FROM feedbacks f
            OUTER APPLY (
                SELECT TOP 1
                    sentiment,
                    confidence_score,
                    analysis_result,
                    model_name,
                    analyzed_at
                FROM feedback_analysis
                WHERE feedback_id = f.feedback_id
                ORDER BY analyzed_at DESC, analysis_id DESC
            ) fa
            WHERE f.feedback_id = :feedbackId
            """;

        return jdbcTemplate.query(
                sql,
                Map.of("feedbackId", feedbackId),
                feedbackResponseRowMapper
        ).stream().findFirst().orElse(null);
    }

    // =====================================================
    // CẬP NHẬT TRẠNG THÁI PHẢN HỒI
    // =====================================================

    public boolean updateStatus(
            Integer feedbackId,
            String feedbackStatus) {

        String sql = """
            UPDATE feedbacks
            SET feedback_status = :feedbackStatus
            WHERE feedback_id = :feedbackId
            """;

        MapSqlParameterSource params =
                new MapSqlParameterSource()
                        .addValue("feedbackId", feedbackId)
                        .addValue("feedbackStatus", feedbackStatus);

        return jdbcTemplate.update(sql, params) > 0;
    }

    // =====================================================
    // LỌC PHẢN HỒI
    // =====================================================

    public List<FeedbackResponse> findByFilters(
            String status,
            String sentiment) {

        StringBuilder sql = new StringBuilder("""
            SELECT
                f.feedback_id,
                f.user_id,
                f.order_id,
                f.dish_id,
                f.rating,
                f.content,
                f.feedback_status,
                fa.sentiment,
                fa.confidence_score,
                fa.analysis_result,
                fa.model_name,
                fa.analyzed_at
            FROM feedbacks f
            OUTER APPLY (
                SELECT TOP 1
                    sentiment,
                    confidence_score,
                    analysis_result,
                    model_name,
                    analyzed_at
                FROM feedback_analysis
                WHERE feedback_id = f.feedback_id
                ORDER BY analyzed_at DESC, analysis_id DESC
            ) fa
            WHERE 1 = 1
            """);

        MapSqlParameterSource params =
                new MapSqlParameterSource();

        if (status != null && !status.isBlank()) {
            sql.append(" AND f.feedback_status = :status");
            params.addValue("status", status);
        }

        if (sentiment != null && !sentiment.isBlank()) {
            sql.append(" AND fa.sentiment = :sentiment");
            params.addValue("sentiment", sentiment);
        }

        sql.append(" ORDER BY f.feedback_id DESC");

        return jdbcTemplate.query(
                sql.toString(),
                params,
                feedbackResponseRowMapper
        );
    }

    // =====================================================
    // THỐNG KÊ PHẢN HỒI
    // =====================================================

    public FeedbackStatisticsResponse getStatistics() {

        String sql = """
            WITH LatestAnalysis AS (
                SELECT
                    feedback_id,
                    sentiment,
                    ROW_NUMBER() OVER (
                        PARTITION BY feedback_id
                        ORDER BY analyzed_at DESC, analysis_id DESC
                    ) AS rn
                FROM feedback_analysis
            )
            SELECT
                COUNT(*) AS total_feedbacks,

                COALESCE(SUM(
                    CASE WHEN la.sentiment = 'POSITIVE'
                    THEN 1 ELSE 0 END
                ), 0) AS positive_count,

                COALESCE(SUM(
                    CASE WHEN la.sentiment = 'NEUTRAL'
                    THEN 1 ELSE 0 END
                ), 0) AS neutral_count,

                COALESCE(SUM(
                    CASE WHEN la.sentiment = 'NEGATIVE'
                    THEN 1 ELSE 0 END
                ), 0) AS negative_count,

                COALESCE(SUM(
                    CASE WHEN la.feedback_id IS NULL
                    THEN 1 ELSE 0 END
                ), 0) AS unanalyzed_count

            FROM feedbacks f
            LEFT JOIN LatestAnalysis la
                ON f.feedback_id = la.feedback_id
                AND la.rn = 1
            """;

        return jdbcTemplate.queryForObject(
                sql,
                Map.of(),
                (rs, rowNum) -> new FeedbackStatisticsResponse(
                        rs.getInt("total_feedbacks"),
                        rs.getInt("positive_count"),
                        rs.getInt("neutral_count"),
                        rs.getInt("negative_count"),
                        rs.getInt("unanalyzed_count")
                )
        );
    }

public List<FeedbackResponse> findByOrderWithAnalysis(
        Integer orderId, Integer userId) {

    String sql = """
        SELECT
            f.feedback_id,
            f.user_id,
            f.order_id,
            f.dish_id,
            f.rating,
            f.content,
            f.feedback_status,
            fa.sentiment,
            fa.confidence_score,
            fa.analysis_result,
            fa.model_name,
            fa.analyzed_at
        FROM feedbacks f
        OUTER APPLY (
            SELECT TOP 1
                analysis.sentiment,
                analysis.confidence_score,
                analysis.analysis_result,
                analysis.model_name,
                analysis.analyzed_at
            FROM feedback_analysis analysis
            WHERE analysis.feedback_id = f.feedback_id
            ORDER BY analysis.analyzed_at DESC, analysis.analysis_id DESC
        ) fa
        WHERE f.order_id = :orderId
          AND f.user_id = :userId
        ORDER BY f.created_at ASC
        """;

    MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("orderId", orderId)
            .addValue("userId", userId);

    return jdbcTemplate.query(sql, params, feedbackResponseRowMapper);
}

}
