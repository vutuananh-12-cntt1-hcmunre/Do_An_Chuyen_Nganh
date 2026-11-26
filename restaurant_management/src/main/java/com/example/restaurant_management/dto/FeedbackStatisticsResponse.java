
package com.example.restaurant_management.dto;

public class FeedbackStatisticsResponse {

    private Integer totalFeedbacks;

    private Integer positiveCount;

    private Integer neutralCount;

    private Integer negativeCount;

    private Integer unanalyzedCount;

    public FeedbackStatisticsResponse(
            Integer totalFeedbacks,
            Integer positiveCount,
            Integer neutralCount,
            Integer negativeCount,
            Integer unanalyzedCount) {

        this.totalFeedbacks = totalFeedbacks;
        this.positiveCount = positiveCount;
        this.neutralCount = neutralCount;
        this.negativeCount = negativeCount;
        this.unanalyzedCount = unanalyzedCount;
    }

    public Integer getTotalFeedbacks() {
        return totalFeedbacks;
    }

    public Integer getPositiveCount() {
        return positiveCount;
    }

    public Integer getNeutralCount() {
        return neutralCount;
    }

    public Integer getNegativeCount() {
        return negativeCount;
    }

    public Integer getUnanalyzedCount() {
        return unanalyzedCount;
    }
}
