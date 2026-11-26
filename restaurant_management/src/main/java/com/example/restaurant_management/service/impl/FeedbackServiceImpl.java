
package com.example.restaurant_management.service.impl;

import java.util.List;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.client.RestClientException;
import org.springframework.web.server.ResponseStatusException;

import com.example.restaurant_management.dto.AiPredictionResponse;
import com.example.restaurant_management.dto.FeedbackRequest;
import com.example.restaurant_management.dto.FeedbackResponse;
import com.example.restaurant_management.dto.FeedbackStatisticsResponse;
import com.example.restaurant_management.repository.FeedbackAnalysisRepository;
import com.example.restaurant_management.repository.FeedbackRepository;
import com.example.restaurant_management.service.AiServiceClient;
import com.example.restaurant_management.service.FeedbackService;

@Service
public class FeedbackServiceImpl implements FeedbackService {

    private static final Logger logger =
            LoggerFactory.getLogger(FeedbackServiceImpl.class);

    private final FeedbackRepository feedbackRepository;
    private final FeedbackAnalysisRepository analysisRepository;
    private final AiServiceClient aiServiceClient;

    public FeedbackServiceImpl(
            FeedbackRepository feedbackRepository,
            FeedbackAnalysisRepository analysisRepository,
            AiServiceClient aiServiceClient) {

        this.feedbackRepository = feedbackRepository;
        this.analysisRepository = analysisRepository;
        this.aiServiceClient = aiServiceClient;
    }

    // =====================================================
    // TẠO PHẢN HỒI
    // =====================================================

    @Override
    @Transactional
    public FeedbackResponse create(
            String username,
            FeedbackRequest request) {

        // 1. Lấy user_id từ tài khoản đăng nhập
        Integer userId =
                feedbackRepository.findUserIdByUsername(username);

        if (userId == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy tài khoản khách hàng"
            );
        }

        // 2. Kiểm tra đơn hàng thuộc khách hàng
        // và đã hoàn thành
        boolean validOrder =
                feedbackRepository.isCompletedOrderOwnedByUser(
                        request.getOrderId(),
                        userId
                );

        if (!validOrder) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Đơn hàng không hợp lệ, không thuộc tài khoản của bạn hoặc chưa hoàn thành"
            );
        }

        // 3. Nếu đánh giá món ăn thì kiểm tra
        // món ăn có thực sự thuộc đơn hàng
        if (request.getDishId() != null) {

            boolean dishExists =
                    feedbackRepository.existsDishInOrder(
                            request.getOrderId(),
                            request.getDishId()
                    );

            if (!dishExists) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Món ăn không thuộc đơn hàng này"
                );
            }
        }

        // 4. Kiểm tra đánh giá trùng
        boolean alreadyReviewed =
                feedbackRepository.existsFeedback(
                        userId,
                        request.getOrderId(),
                        request.getDishId()
                );

        if (alreadyReviewed) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    request.getDishId() == null
                            ? "Bạn đã đánh giá đơn hàng này rồi"
                            : "Bạn đã đánh giá món ăn này trong đơn hàng rồi"
            );
        }

        // 5. Chuẩn hóa nội dung bình luận
        if (request.getContent() != null) {
            String content = request.getContent().trim();

            request.setContent(
                    content.isEmpty() ? null : content
            );
        }

        // 6. Lưu phản hồi
        Integer feedbackId =
                feedbackRepository.create(userId, request);

        if (feedbackId == null) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Không thể tạo phản hồi"
            );
        }

        // 7. Gọi AI nếu có nội dung bình luận
        if (request.getContent() != null) {

            try {
                AiPredictionResponse prediction =
                        aiServiceClient.analyzeFeedback(
                                request.getContent()
                        );

                // 8. Lưu kết quả phân tích AI
                if (prediction != null
                        && prediction.data() != null) {

                    analysisRepository.save(
                            feedbackId,
                            prediction.data()
                    );
                }

            } catch (RestClientException e) {

                // AI lỗi không làm mất phản hồi khách hàng
                logger.warn(
                        "Không thể phân tích feedback ID {} bằng AI: {}",
                        feedbackId,
                        e.getMessage()
                );
            }
        }

        // 9. Trả về phản hồi kèm kết quả AI
        return feedbackRepository.findByIdWithAnalysis(
                feedbackId
        );
    }

    // =====================================================
    // LẤY TẤT CẢ PHẢN HỒI
    // =====================================================

    @Override
    public List<FeedbackResponse> findAll() {
        return feedbackRepository.findAllWithAnalysis();
    }

    // =====================================================
    // LẤY PHẢN HỒI THEO ID
    // =====================================================

    @Override
    public FeedbackResponse findById(Integer feedbackId) {
        return feedbackRepository.findByIdWithAnalysis(
                feedbackId
        );
    }

    // =====================================================
    // CẬP NHẬT TRẠNG THÁI
    // =====================================================

    @Override
    public boolean updateStatus(
            Integer feedbackId,
            String feedbackStatus) {

        return feedbackRepository.updateStatus(
                feedbackId,
                feedbackStatus
        );
    }

    // =====================================================
    // LỌC PHẢN HỒI
    // =====================================================

    @Override
    public List<FeedbackResponse> findByFilters(
            String status,
            String sentiment) {

        return feedbackRepository.findByFilters(
                status,
                sentiment
        );
    }

    @Override
    public FeedbackStatisticsResponse getStatistics() {
        return feedbackRepository.getStatistics();
    }

@Override
public List<FeedbackResponse> findByOrder(String username, Integer orderId) {

    Integer userId = feedbackRepository.findUserIdByUsername(username);

    if (userId == null) {
        throw new org.springframework.web.server.ResponseStatusException(
                org.springframework.http.HttpStatus.UNAUTHORIZED,
                "Không tìm thấy tài khoản khách hàng"
        );
    }

    return feedbackRepository.findByOrderWithAnalysis(orderId, userId);
}

}
