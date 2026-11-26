package com.example.restaurant_management.repository;

import java.util.List;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

@Repository
public class ChatMessageRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public ChatMessageRepository(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Lưu tin nhắn của người dùng hoặc chatbot
    public Integer insertMessage(
            Integer sessionId,
            String senderType,
            String content) {

        String sql = """
            INSERT INTO chat_messages (
                session_id,
                sender_type,
                message_content,
                sent_at
            )
            OUTPUT INSERTED.message_id
            VALUES (
                :sessionId,
                :senderType,
                :content,
                SYSDATETIME()
            )
            """;

        var params = new MapSqlParameterSource()
                .addValue("sessionId", sessionId)
                .addValue("senderType", senderType)
                .addValue("content", content);

        return jdbcTemplate.queryForObject(
                sql, params, Integer.class);
    }

    // Lấy lịch sử tin nhắn của một phiên trò chuyện
    public List<ChatMessage> findBySessionId(Integer sessionId) {

        String sql = """
            SELECT
                message_id,
                session_id,
                sender_type,
                message_content,
                sent_at
            FROM chat_messages
            WHERE session_id = :sessionId
            ORDER BY sent_at ASC, message_id ASC
            """;

        var params = new MapSqlParameterSource()
                .addValue("sessionId", sessionId);

        return jdbcTemplate.query(sql, params, (rs, rowNum) ->
                new ChatMessage(
                        rs.getInt("message_id"),
                        rs.getInt("session_id"),
                        rs.getString("sender_type"),
                        rs.getString("message_content"),
                        rs.getTimestamp("sent_at").toLocalDateTime()
                ));
    }

    // DTO nội bộ biểu diễn một tin nhắn
    public record ChatMessage(
            Integer messageId,
            Integer sessionId,
            String senderType,
            String messageContent,
            java.time.LocalDateTime sentAt
    ) {}

    // Lấy N tin nhắn gần nhất trong một phiên trò chuyện
    public List<ChatMessage> findRecentMessages(
            Integer sessionId,
            Integer limit) {

        String sql = """
            SELECT *
            FROM (
                SELECT TOP (:limit)
                    message_id,
                    session_id,
                    sender_type,
                    message_content,
                    sent_at
                FROM chat_messages
                WHERE session_id = :sessionId
                ORDER BY sent_at DESC, message_id DESC
            ) AS recent_messages
            ORDER BY sent_at ASC, message_id ASC
            """;

        var params = new MapSqlParameterSource()
                .addValue("sessionId", sessionId)
                .addValue("limit", limit);

        return jdbcTemplate.query(sql, params, (rs, rowNum) ->
                new ChatMessage(
                        rs.getInt("message_id"),
                        rs.getInt("session_id"),
                        rs.getString("sender_type"),
                        rs.getString("message_content"),
                        rs.getTimestamp("sent_at").toLocalDateTime()
                ));
    }

}