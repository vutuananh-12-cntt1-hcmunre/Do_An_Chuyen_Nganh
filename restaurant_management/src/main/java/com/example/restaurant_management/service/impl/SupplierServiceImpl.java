
package com.example.restaurant_management.service.impl;

import java.util.List;
import java.util.UUID;
import java.util.regex.Pattern;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.restaurant_management.dto.Supplier;
import com.example.restaurant_management.dto.SupplierResponse;
import com.example.restaurant_management.repository.SupplierRepository;
import com.example.restaurant_management.service.SupplierService;

@Service
public class SupplierServiceImpl implements SupplierService {

    private final SupplierRepository supplierRepository;

    public SupplierServiceImpl(SupplierRepository supplierRepository) {
        this.supplierRepository = supplierRepository;
    }

    // Chuyển Supplier thành SupplierResponse
    private SupplierResponse convertToResponse(Supplier supplier) {
        return new SupplierResponse(
                supplier.getSupplierId(),
                supplier.getSupplierCode(),
                supplier.getSupplierName(),
                supplier.getPhone(),
                supplier.getEmail(),
                supplier.getAddress(),
                supplier.getIsActive(),
                supplier.getCreatedAt()
        );
    }

    // Tự động tạo mã nhà cung cấp
    private String generateSupplierCode() {
        return "SUP-" + UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 8)
                .toUpperCase();
    }

    // Kiểm tra dữ liệu nhà cung cấp
    private void validateSupplier(Supplier supplier) {

        if (supplier.getSupplierName() == null
                || supplier.getSupplierName().trim().isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tên nhà cung cấp không được để trống"
            );
        }

        supplier.setSupplierName(supplier.getSupplierName().trim());

        if (supplier.getSupplierName().length() > 255) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tên nhà cung cấp không được vượt quá 255 ký tự"
            );
        }

        // Số điện thoại là trường bắt buộc
        if (supplier.getPhone() == null
                || !Pattern.matches(
                        "^0[0-9]{9}$",
                        supplier.getPhone().trim())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Số điện thoại phải gồm 10 chữ số và bắt đầu bằng 0"
            );
        }

        supplier.setPhone(supplier.getPhone().trim());

        // Kiểm tra email nếu có nhập
        if (supplier.getEmail() != null
                && !supplier.getEmail().trim().isEmpty()) {

            String email = supplier.getEmail().trim();

            if (email.length() > 255
                    || !Pattern.matches(
                            "^[A-Za-z0-9+_.-]+@[A-Za-z0-9.-]+\\.[A-Za-z]{2,}$",
                            email)) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Email không hợp lệ hoặc vượt quá 255 ký tự"
                );
            }

            supplier.setEmail(email);
        } else {
            supplier.setEmail(null);
        }

        // Kiểm tra địa chỉ
        if (supplier.getAddress() != null
                && supplier.getAddress().length() > 500) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Địa chỉ không được vượt quá 500 ký tự"
            );
        }
    }

    // Lấy danh sách nhà cung cấp
    @Override
    public List<SupplierResponse> getAllSuppliers() {
        return supplierRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // Lấy nhà cung cấp theo ID
    @Override
    public SupplierResponse getSupplierById(Integer supplierId) {

        Supplier supplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy nhà cung cấp"
                ));

        return convertToResponse(supplier);
    }

    // Thêm nhà cung cấp
    @Override
    public SupplierResponse createSupplier(Supplier supplier) {

        validateSupplier(supplier);

        if (supplierRepository.existsBySupplierName(
                supplier.getSupplierName())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Tên nhà cung cấp đã tồn tại"
            );
        }

        // Tự động sinh mã nhà cung cấp
        supplier.setSupplierCode(generateSupplierCode());

        // Mặc định nhà cung cấp được kích hoạt
        supplier.setIsActive(true);

        Integer supplierId = supplierRepository.insert(supplier);

        return getSupplierById(supplierId);
    }

    // Cập nhật thông tin nhà cung cấp
    @Override
    public SupplierResponse updateSupplier(
            Integer supplierId, Supplier supplier) {

        Supplier existingSupplier = supplierRepository.findById(supplierId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy nhà cung cấp"
                ));

        validateSupplier(supplier);

        if (supplierRepository.existsBySupplierNameAndIdNot(
                supplier.getSupplierName(), supplierId)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Tên nhà cung cấp đã tồn tại"
            );
        }

        supplierRepository.update(supplierId, supplier);

        return getSupplierById(supplierId);
    }

    // Kích hoạt / ngừng hoạt động nhà cung cấp
    @Override
    public SupplierResponse updateActiveStatus(
            Integer supplierId, Boolean isActive) {

        if (isActive == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Trạng thái không được để trống"
            );
        }

        if (supplierRepository.findById(supplierId).isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy nhà cung cấp"
            );
        }

        supplierRepository.updateActiveStatus(supplierId, isActive);

        return getSupplierById(supplierId);
    }
}
