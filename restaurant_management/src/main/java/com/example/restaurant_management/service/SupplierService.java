
package com.example.restaurant_management.service;

import java.util.List;

import com.example.restaurant_management.dto.Supplier;
import com.example.restaurant_management.dto.SupplierResponse;

public interface SupplierService {

    // Lấy danh sách nhà cung cấp
    List<SupplierResponse> getAllSuppliers();

    // Lấy thông tin nhà cung cấp theo ID
    SupplierResponse getSupplierById(Integer supplierId);

    // Thêm nhà cung cấp
    SupplierResponse createSupplier(Supplier supplier);

    // Cập nhật thông tin nhà cung cấp
    SupplierResponse updateSupplier(Integer supplierId, Supplier supplier);

    // Kích hoạt / ngừng hoạt động nhà cung cấp
    SupplierResponse updateActiveStatus(Integer supplierId, Boolean isActive);
}
