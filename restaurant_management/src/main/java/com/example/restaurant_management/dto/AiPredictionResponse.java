
package com.example.restaurant_management.dto;

import java.util.Map;

import com.fasterxml.jackson.annotation.JsonProperty;

public record AiPredictionResponse(
    String status,
    PredictionData data
) {

    public record PredictionData(
        String text,

        @JsonProperty("processed_text")
        String processedText,

        String sentiment,

        double confidence,

        Map<String, Double> probabilities
    ) {
    }
}
