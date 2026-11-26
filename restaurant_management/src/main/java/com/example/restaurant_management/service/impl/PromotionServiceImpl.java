
package com.example.restaurant_management.service.impl;

import java.math.BigDecimal;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.restaurant_management.dto.Promotion;
import com.example.restaurant_management.dto.PromotionResponse;
import com.example.restaurant_management.repository.PromotionRepository;
import com.example.restaurant_management.service.PromotionService;

@Service
public class PromotionServiceImpl implements PromotionService {

    private final PromotionRepository promotionRepository;

    public PromotionServiceImpl(PromotionRepository promotionRepository) {
        this.promotionRepository = promotionRepository;
    }

    private PromotionResponse mapToResponse(Promotion promotion) {
        return new PromotionResponse(
                promotion.getPromotionId(),
                promotion.getPromotionCode(),
                promotion.getPromotionName(),
                promotion.getDescription(),
                promotion.getDiscountType(),
                promotion.getDiscountValue(),
                promotion.getMinOrderAmount(),
                promotion.getMaxDiscountAmount(),
                promotion.getStartAt(),
                promotion.getEndAt(),
                promotion.getUsageLimit(),
                promotion.getUsedCount(),
                promotion.getIsActive(),
                promotion.getCreatedAt()
        );
    }

    // Lấy tất cả khuyến mãi
    @Override
    public List<PromotionResponse> getAllPromotions() {
        return promotionRepository.findAll()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Lấy khuyến mãi đang có hiệu lực cho khách hàng
    @Override
    public List<PromotionResponse> getAvailablePromotions() {
        return promotionRepository.findCurrentlyAvailable()
                .stream()
                .map(this::mapToResponse)
                .toList();
    }

    // Lấy khuyến mãi theo ID
    @Override
    public PromotionResponse getPromotionById(Integer promotionId) {
        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy khuyến mãi"
                ));

        return mapToResponse(promotion);
    }

    // Kiểm tra dữ liệu khuyến mãi
    private void validatePromotion(Promotion promotion) {

        if (promotion.getPromotionCode() == null
                || promotion.getPromotionCode().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mã khuyến mãi không được để trống"
            );
        }

        if (promotion.getPromotionName() == null
                || promotion.getPromotionName().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tên khuyến mãi không được để trống"
            );
        }

        if (promotion.getDiscountType() == null
                || !(promotion.getDiscountType().equals("PERCENTAGE")
                || promotion.getDiscountType().equals("FIXED_AMOUNT"))) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Loại giảm giá phải là PERCENTAGE hoặc FIXED_AMOUNT"
            );
        }

        if (promotion.getDiscountValue() == null
                || promotion.getDiscountValue().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Giá trị giảm giá phải lớn hơn 0"
            );
        }

        if ("PERCENTAGE".equals(promotion.getDiscountType())
                && promotion.getDiscountValue().compareTo(
                        new BigDecimal("100")) > 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Phần trăm giảm giá không được vượt quá 100"
            );
        }

        if (promotion.getMinOrderAmount() == null
                || promotion.getMinOrderAmount().compareTo(BigDecimal.ZERO) < 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Giá trị đơn hàng tối thiểu không hợp lệ"
            );
        }

        if (promotion.getMaxDiscountAmount() != null
                && promotion.getMaxDiscountAmount().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mức giảm tối đa phải lớn hơn 0"
            );
        }

        if (promotion.getStartAt() == null
                || promotion.getEndAt() == null
                || !promotion.getStartAt().isBefore(promotion.getEndAt())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Thời gian bắt đầu phải trước thời gian kết thúc"
            );
        }

        if (promotion.getUsageLimit() != null
                && promotion.getUsageLimit() <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Giới hạn lượt sử dụng phải lớn hơn 0"
            );
        }
    }

    // Tạo khuyến mãi
    @Override
    @Transactional
    public PromotionResponse createPromotion(Promotion promotion) {

        validatePromotion(promotion);

        String promotionCode = promotion.getPromotionCode()
                .trim()
                .toUpperCase();

        promotion.setPromotionCode(promotionCode);

        if (promotionRepository.existsByCode(promotionCode)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Mã khuyến mãi đã tồn tại"
            );
        }

        promotion.setUsedCount(0);

        if (promotion.getIsActive() == null) {
            promotion.setIsActive(true);
        }

        Integer promotionId = promotionRepository.insert(promotion);

        if (promotionId == null) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Không thể tạo khuyến mãi"
            );
        }

        return getPromotionById(promotionId);
    }

    // Cập nhật khuyến mãi
    @Override
    @Transactional
    public PromotionResponse updatePromotion(
            Integer promotionId,
            Promotion promotion) {

        Promotion existingPromotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy khuyến mãi"
                ));

        validatePromotion(promotion);

        String promotionCode = promotion.getPromotionCode()
                .trim()
                .toUpperCase();

        promotion.setPromotionCode(promotionCode);

        if (promotionRepository.existsByCodeAndIdNot(
                promotionCode, promotionId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Mã khuyến mãi đã tồn tại"
            );
        }

        if (promotion.getUsageLimit() != null
                && promotion.getUsageLimit() < existingPromotion.getUsedCount()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Giới hạn sử dụng không được nhỏ hơn số lượt đã sử dụng"
            );
        }

        promotion.setUsedCount(existingPromotion.getUsedCount());

        if (promotion.getIsActive() == null) {
            promotion.setIsActive(existingPromotion.getIsActive());
        }

        promotionRepository.update(promotionId, promotion);

        return getPromotionById(promotionId);
    }

    // Kích hoạt / ngừng kích hoạt khuyến mãi
    @Override
    @Transactional
    public PromotionResponse updateActiveStatus(
            Integer promotionId,
            Boolean isActive) {

        if (isActive == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Trạng thái không được để trống"
            );
        }

        Promotion promotion = promotionRepository.findById(promotionId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy khuyến mãi"
                ));

        promotionRepository.updateActiveStatus(promotionId, isActive);

        promotion.setIsActive(isActive);

        return mapToResponse(promotion);
    }
}
