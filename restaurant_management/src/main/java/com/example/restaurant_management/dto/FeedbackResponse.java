
package com.example.restaurant_management.dto;

import java.time.LocalDateTime;

public class FeedbackResponse {

    private Integer feedbackId;
    private Integer userId;
    private Integer orderId;
    private Integer dishId;
    private Integer rating;
    private String content;
    private String feedbackStatus;

    // Thông tin phân tích AI
    private String sentiment;
    private Double confidenceScore;
    private String analysisResult;
    private String modelName;
    private LocalDateTime analyzedAt;

    public FeedbackResponse(
            Integer feedbackId,
            Integer userId,
            Integer orderId,
            Integer dishId,
            Integer rating,
            String content,
            String feedbackStatus,
            String sentiment,
            Double confidenceScore,
            String analysisResult,
            String modelName,
            LocalDateTime analyzedAt) {

        this.feedbackId = feedbackId;
        this.userId = userId;
        this.orderId = orderId;
        this.dishId = dishId;
        this.rating = rating;
        this.content = content;
        this.feedbackStatus = feedbackStatus;
        this.sentiment = sentiment;
        this.confidenceScore = confidenceScore;
        this.analysisResult = analysisResult;
        this.modelName = modelName;
        this.analyzedAt = analyzedAt;
    }

    public Integer getFeedbackId() {
        return feedbackId;
    }

    public Integer getUserId() {
        return userId;
    }

    public Integer getOrderId() {
        return orderId;
    }

    public Integer getDishId() {
        return dishId;
    }

    public Integer getRating() {
        return rating;
    }

    public String getContent() {
        return content;
    }

    public String getFeedbackStatus() {
        return feedbackStatus;
    }

    public String getSentiment() {
        return sentiment;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public String getAnalysisResult() {
        return analysisResult;
    }

    public String getModelName() {
        return modelName;
    }

    public LocalDateTime getAnalyzedAt() {
        return analyzedAt;
    }
}
