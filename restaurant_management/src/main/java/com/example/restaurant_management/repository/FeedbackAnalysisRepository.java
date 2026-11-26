
package com.example.restaurant_management.repository;

import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.restaurant_management.dto.AiPredictionResponse;

@Repository
public class FeedbackAnalysisRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public FeedbackAnalysisRepository(
            NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    public void save(Integer feedbackId, AiPredictionResponse.PredictionData data) {

        String sql = """
            INSERT INTO feedback_analysis (
                feedback_id,
                sentiment,
                confidence_score,
                analysis_result,
                model_name
            )
            VALUES (
                :feedbackId,
                :sentiment,
                :confidence,
                :analysisResult,
                :modelName
            )
            """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("feedbackId", feedbackId)
                .addValue("sentiment", data.sentiment())
                .addValue("confidence", data.confidence())
                .addValue("analysisResult", data.processedText())
                .addValue("modelName", "vinai/phobert-base-v2");

        jdbcTemplate.update(sql, params);
    }
}
