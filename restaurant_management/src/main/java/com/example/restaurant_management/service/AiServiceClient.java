
package com.example.restaurant_management.service;

import org.springframework.stereotype.Service;
import org.springframework.web.client.RestClient;

import com.example.restaurant_management.dto.AiPredictionRequest;
import com.example.restaurant_management.dto.AiPredictionResponse;

@Service
public class AiServiceClient {

    private final RestClient aiRestClient;

    public AiServiceClient(RestClient aiRestClient) {
        this.aiRestClient = aiRestClient;
    }

    public AiPredictionResponse analyzeFeedback(String text) {

        AiPredictionRequest request =
                new AiPredictionRequest(text);

        return aiRestClient.post()
                .uri("/predict")
                .body(request)
                .retrieve()
                .body(AiPredictionResponse.class);
    }
}
