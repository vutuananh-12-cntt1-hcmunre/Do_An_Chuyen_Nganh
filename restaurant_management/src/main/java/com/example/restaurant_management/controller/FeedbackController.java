
package com.example.restaurant_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.example.restaurant_management.dto.FeedbackRequest;
import com.example.restaurant_management.dto.FeedbackResponse;
import com.example.restaurant_management.dto.FeedbackStatisticsResponse;
import com.example.restaurant_management.dto.FeedbackStatusRequest;
import com.example.restaurant_management.service.FeedbackService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/feedbacks")
public class FeedbackController {

    private final FeedbackService feedbackService;

    public FeedbackController(FeedbackService feedbackService) {
        this.feedbackService = feedbackService;
    }

    // Khách hàng gửi phản hồi
    @PostMapping
    public ResponseEntity<FeedbackResponse> create(
            @Valid @RequestBody FeedbackRequest request,
            Authentication authentication) {

        String username = authentication.getName();

        FeedbackResponse response =
                feedbackService.create(username, request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(response);
    }

    // Lấy danh sách phản hồi và lọc theo trạng thái, cảm xúc AI
    @GetMapping
    public ResponseEntity<List<FeedbackResponse>> findAll(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String sentiment) {

        List<FeedbackResponse> responses;

        if ((status == null || status.isBlank())
                && (sentiment == null || sentiment.isBlank())) {

            responses = feedbackService.findAll();

        } else {

            responses = feedbackService.findByFilters(
                    status,
                    sentiment
            );
        }

        return ResponseEntity.ok(responses);
    }

    // Lấy phản hồi theo ID
    @GetMapping("/{feedbackId}")
    public ResponseEntity<FeedbackResponse> findById(
            @PathVariable Integer feedbackId) {

        FeedbackResponse response =
                feedbackService.findById(feedbackId);

        if (response == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(response);
    }

    // Duyệt hoặc ẩn phản hồi
    @PatchMapping("/{feedbackId}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable Integer feedbackId,
            @Valid @RequestBody FeedbackStatusRequest request) {

        boolean updated = feedbackService.updateStatus(
                feedbackId,
                request.getFeedbackStatus()
        );

        if (!updated) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body("Không tìm thấy phản hồi có ID: " + feedbackId);
        }

        return ResponseEntity.ok(
                "Cập nhật trạng thái phản hồi thành công"
        );
    }
    @GetMapping("/statistics")
        public ResponseEntity<FeedbackStatisticsResponse> getStatistics() {
            FeedbackStatisticsResponse response = feedbackService.getStatistics();
            return ResponseEntity.ok(response);
        }

@GetMapping("/order/{orderId}")
public ResponseEntity<List<FeedbackResponse>> findByOrder(
        @PathVariable Integer orderId,
        Authentication authentication) {

    String username = authentication.getName();

    List<FeedbackResponse> responses =
            feedbackService.findByOrder(username, orderId);

    return ResponseEntity.ok(responses);
}

}
