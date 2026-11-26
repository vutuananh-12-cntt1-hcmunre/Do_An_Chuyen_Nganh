
package com.example.restaurant_management.service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.restaurant_management.dto.PurchaseReceipt;
import com.example.restaurant_management.dto.PurchaseReceiptDetail;
import com.example.restaurant_management.dto.PurchaseReceiptDetailResponse;
import com.example.restaurant_management.dto.PurchaseReceiptResponse;
import com.example.restaurant_management.repository.PurchaseReceiptDetailRepository;
import com.example.restaurant_management.repository.PurchaseReceiptRepository;
import com.example.restaurant_management.service.PurchaseReceiptService;

@Service
public class PurchaseReceiptServiceImpl implements PurchaseReceiptService {

    private final PurchaseReceiptRepository receiptRepository;
    private final PurchaseReceiptDetailRepository detailRepository;

    public PurchaseReceiptServiceImpl(
            PurchaseReceiptRepository receiptRepository,
            PurchaseReceiptDetailRepository detailRepository) {
        this.receiptRepository = receiptRepository;
        this.detailRepository = detailRepository;
    }

    // Lấy tất cả phiếu nhập
    @Override
    public List<PurchaseReceiptResponse> getAllReceipts() {
        return receiptRepository.findAll();
    }

    // Lấy phiếu nhập theo ID
    @Override
    public PurchaseReceiptResponse getReceiptById(Integer receiptId) {
        return receiptRepository.findById(receiptId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy phiếu nhập"
                ));
    }

    // Tạo phiếu nhập
    @Override
    @Transactional
    public PurchaseReceiptResponse createReceipt(PurchaseReceipt receipt) {

        if (receipt.getReceiptCode() == null
                || receipt.getReceiptCode().isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mã phiếu nhập không được để trống"
            );
        }

        if (receipt.getSupplierId() == null
                || !receiptRepository.existsSupplierById(
                        receipt.getSupplierId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy nhà cung cấp"
            );
        }

        if (!receiptRepository.isSupplierActive(receipt.getSupplierId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nhà cung cấp đã bị khóa"
            );
        }

        if (receipt.getEmployeeId() == null
                || !receiptRepository.existsEmployeeById(
                        receipt.getEmployeeId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy nhân viên"
            );
        }

        Integer receiptId = receiptRepository.insert(
                receipt.getReceiptCode(),
                receipt.getSupplierId(),
                receipt.getEmployeeId(),
                receipt.getNote()
        );

        return getReceiptById(receiptId);
    }

    // Cập nhật thông tin phiếu nhập
    @Override
    @Transactional
    public PurchaseReceiptResponse updateReceipt(
            Integer receiptId,
            PurchaseReceipt receipt) {

        PurchaseReceiptResponse existing = getReceiptById(receiptId);

        if (!"DRAFT".equals(existing.getReceiptStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Chỉ được cập nhật phiếu nhập ở trạng thái DRAFT"
            );
        }

        if (receipt.getSupplierId() == null
                || !receiptRepository.existsSupplierById(
                        receipt.getSupplierId())) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy nhà cung cấp"
            );
        }

        if (!receiptRepository.isSupplierActive(receipt.getSupplierId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nhà cung cấp đã bị khóa"
            );
        }

        boolean updated = receiptRepository.update(
                receiptId,
                receipt.getSupplierId(),
                receipt.getNote()
        );

        if (!updated) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Không thể cập nhật phiếu nhập"
            );
        }

        return getReceiptById(receiptId);
    }

    // Xác nhận phiếu nhập và cộng tồn kho
    @Override
    @Transactional
    public PurchaseReceiptResponse confirmReceipt(Integer receiptId) {

        PurchaseReceiptResponse receipt = getReceiptById(receiptId);

        if (!"DRAFT".equals(receipt.getReceiptStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Chỉ được xác nhận phiếu nhập ở trạng thái DRAFT"
            );
        }

        List<Map<String, Object>> stockItems =
                detailRepository.findStockItemsByReceiptId(receiptId);

        if (stockItems.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Phiếu nhập phải có ít nhất một nguyên liệu"
            );
        }

        // Kiểm tra nguyên liệu đang hoạt động
        for (Map<String, Object> item : stockItems) {

            Integer ingredientId =
                    ((Number) item.get("ingredient_id")).intValue();

            if (!detailRepository.isIngredientActive(ingredientId)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Nguyên liệu ID " + ingredientId + " đã bị khóa"
                );
            }
        }

        // Xác nhận phiếu nhập
        if (!receiptRepository.confirm(receiptId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Phiếu nhập đã được xác nhận hoặc không thể xác nhận"
            );
        }

        // Cộng tồn kho
        for (Map<String, Object> item : stockItems) {

            Integer ingredientId =
                    ((Number) item.get("ingredient_id")).intValue();

            BigDecimal quantity =
                    new BigDecimal(item.get("quantity").toString());

            boolean increased = detailRepository.increaseIngredientStock(
                    ingredientId,
                    quantity
            );

            if (!increased) {
                throw new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Không thể cập nhật tồn kho nguyên liệu ID "
                                + ingredientId
                );
            }
        }

        return getReceiptById(receiptId);
    }

    // Hủy phiếu nhập
    @Override
    @Transactional
    public void cancelReceipt(Integer receiptId) {

        PurchaseReceiptResponse receipt = getReceiptById(receiptId);

        if (!"DRAFT".equals(receipt.getReceiptStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Chỉ được hủy phiếu nhập ở trạng thái DRAFT"
            );
        }

        if (!receiptRepository.cancel(receiptId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Không thể hủy phiếu nhập"
            );
        }
    }

    // Lấy danh sách chi tiết phiếu nhập
    @Override
    public List<PurchaseReceiptDetailResponse> getReceiptDetails(
            Integer receiptId) {

        getReceiptById(receiptId);

        return detailRepository.findByReceiptId(receiptId);
    }

    // Thêm nguyên liệu vào phiếu nhập
    @Override
    @Transactional
    public PurchaseReceiptDetailResponse addReceiptDetail(
            Integer receiptId,
            PurchaseReceiptDetail detail) {

        PurchaseReceiptResponse receipt = getReceiptById(receiptId);

        if (!"DRAFT".equals(receipt.getReceiptStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Chỉ được thêm nguyên liệu vào phiếu DRAFT"
            );
        }

        validateDetail(detail);

        Integer ingredientId = detail.getIngredientId();

        if (!detailRepository.existsIngredientById(ingredientId)) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy nguyên liệu"
            );
        }

        if (!detailRepository.isIngredientActive(ingredientId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nguyên liệu đã bị khóa"
            );
        }

        if (detailRepository.existsByReceiptIdAndIngredientId(
                receiptId, ingredientId)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Nguyên liệu đã tồn tại trong phiếu nhập"
            );
        }

        Integer detailId = detailRepository.insert(
                receiptId,
                ingredientId,
                detail.getQuantity(),
                detail.getUnitPrice()
        );

        updateReceiptTotal(receiptId);

        return detailRepository.findById(detailId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Không thể lấy chi tiết phiếu nhập vừa tạo"
                ));
    }

    // Cập nhật chi tiết phiếu nhập
    @Override
    @Transactional
    public PurchaseReceiptDetailResponse updateReceiptDetail(
            Integer receiptDetailId,
            PurchaseReceiptDetail detail) {

        PurchaseReceiptDetailResponse existing =
                detailRepository.findById(receiptDetailId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Không tìm thấy chi tiết phiếu nhập"
                        ));

        PurchaseReceiptResponse receipt =
                getReceiptById(existing.getReceiptId());

        if (!"DRAFT".equals(receipt.getReceiptStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Chỉ được cập nhật chi tiết phiếu DRAFT"
            );
        }

        // Khi cập nhật chỉ cần số lượng và đơn giá
        // Không yêu cầu ingredientId
        if (detail.getQuantity() == null
                || detail.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Số lượng nhập phải lớn hơn 0"
            );
        }

        if (detail.getUnitPrice() == null
                || detail.getUnitPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Đơn giá phải lớn hơn 0"
            );
        }

        boolean updated = detailRepository.update(
                receiptDetailId,
                detail.getQuantity(),
                detail.getUnitPrice()
        );

        if (!updated) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Không thể cập nhật chi tiết phiếu nhập"
            );
        }

        updateReceiptTotal(existing.getReceiptId());

        return detailRepository.findById(receiptDetailId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy chi tiết phiếu nhập"
                ));
    }

    // Xóa chi tiết phiếu nhập
    @Override
    @Transactional
    public void deleteReceiptDetail(Integer receiptDetailId) {

        PurchaseReceiptDetailResponse existing =
                detailRepository.findById(receiptDetailId)
                        .orElseThrow(() -> new ResponseStatusException(
                                HttpStatus.NOT_FOUND,
                                "Không tìm thấy chi tiết phiếu nhập"
                        ));

        PurchaseReceiptResponse receipt =
                getReceiptById(existing.getReceiptId());

        if (!"DRAFT".equals(receipt.getReceiptStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Chỉ được xóa chi tiết phiếu DRAFT"
            );
        }

        boolean deleted = detailRepository.delete(receiptDetailId);

        if (!deleted) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Không thể xóa chi tiết phiếu nhập"
            );
        }

        updateReceiptTotal(existing.getReceiptId());
    }

    // Kiểm tra dữ liệu khi thêm nguyên liệu
    private void validateDetail(PurchaseReceiptDetail detail) {

        if (detail.getIngredientId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nguyên liệu không được để trống"
            );
        }

        if (detail.getQuantity() == null
                || detail.getQuantity().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Số lượng nhập phải lớn hơn 0"
            );
        }

        if (detail.getUnitPrice() == null
                || detail.getUnitPrice().compareTo(BigDecimal.ZERO) <= 0) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Đơn giá phải lớn hơn 0"
            );
        }
    }

    // Tính lại tổng tiền phiếu nhập
    private void updateReceiptTotal(Integer receiptId) {

        BigDecimal totalAmount =
                detailRepository.calculateTotalAmount(receiptId);

        boolean updated = receiptRepository.updateTotalAmount(
                receiptId,
                totalAmount
        );

        if (!updated) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Không thể cập nhật tổng tiền phiếu nhập"
            );
        }
    }
}
