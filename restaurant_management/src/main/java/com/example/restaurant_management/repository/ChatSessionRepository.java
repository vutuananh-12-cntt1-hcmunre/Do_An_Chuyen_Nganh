package com.example.restaurant_management.repository;

import java.util.List;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ChatSessionRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public ChatSessionRepository(
            NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Tạo phiên trò chuyện mới
    public Integer createSession(Integer userId) {

        String sql = """
            INSERT INTO chat_sessions (
                user_id,
                session_status,
                started_at
            )
            OUTPUT INSERTED.session_id
            VALUES (
                :userId,
                'ACTIVE',
                SYSDATETIME()
            )
            """;

        var params = new MapSqlParameterSource()
                .addValue("userId", userId);

        return jdbcTemplate.queryForObject(
                sql,
                params,
                Integer.class
        );
    }

    // Tìm phiên trò chuyện đang hoạt động
    public Integer findActiveSession(Integer userId) {

        String sql = """
            SELECT TOP 1 session_id
            FROM chat_sessions
            WHERE user_id = :userId
              AND session_status = 'ACTIVE'
              AND ended_at IS NULL
            ORDER BY started_at DESC
            """;

        var params = new MapSqlParameterSource()
                .addValue("userId", userId);

        List<Integer> sessions = jdbcTemplate.query(
                sql,
                params,
                (rs, rowNum) -> rs.getInt("session_id")
        );

        return sessions.isEmpty() ? null : sessions.get(0);
    }

    // Đóng phiên trò chuyện
    public boolean closeSession(Integer sessionId) {

        String sql = """
            UPDATE chat_sessions
            SET
                session_status = 'CLOSED',
                ended_at = SYSDATETIME()
            WHERE session_id = :sessionId
              AND session_status = 'ACTIVE'
            """;

        var params = new MapSqlParameterSource()
                .addValue("sessionId", sessionId);

        return jdbcTemplate.update(sql, params) > 0;
    }
    // Kiểm tra phiên trò chuyện có thuộc về người dùng không
public boolean isSessionOwnedByUser(
        Integer sessionId,
        Integer userId) {

    String sql = """
        SELECT COUNT(*)
        FROM chat_sessions
        WHERE session_id = :sessionId
          AND user_id = :userId
        """;

    var params = new MapSqlParameterSource()
            .addValue("sessionId", sessionId)
            .addValue("userId", userId);

    Integer count = jdbcTemplate.queryForObject(
            sql, params, Integer.class);

    return count != null && count > 0;
}
}