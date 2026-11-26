
package com.example.restaurant_management.controller;

import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.restaurant_management.dto.AiPredictionRequest;
import com.example.restaurant_management.dto.AiPredictionResponse;
import com.example.restaurant_management.service.AiServiceClient;

@RestController
@RequestMapping("/api/ai")
public class AiController {

    private final AiServiceClient aiServiceClient;

    public AiController(AiServiceClient aiServiceClient) {
        this.aiServiceClient = aiServiceClient;
    }

    @PostMapping("/predict")
    public AiPredictionResponse predict(
            @RequestBody AiPredictionRequest request) {

        return aiServiceClient.analyzeFeedback(request.text());
    }
}
