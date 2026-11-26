
package com.example.restaurant_management.service;

import java.util.List;

import com.example.restaurant_management.dto.CustomerGroup;
import com.example.restaurant_management.dto.CustomerGroupResponse;

public interface CustomerGroupService {

    // Lấy danh sách nhóm khách hàng
    List<CustomerGroupResponse> getAllCustomerGroups();

    // Lấy nhóm khách hàng theo ID
    CustomerGroupResponse getCustomerGroupById(
            Integer customerGroupId);

    // Tạo nhóm khách hàng
    CustomerGroupResponse createCustomerGroup(
            CustomerGroup group);

    // Cập nhật nhóm khách hàng
    CustomerGroupResponse updateCustomerGroup(
            Integer customerGroupId,
            CustomerGroup group);

    // Kích hoạt / vô hiệu hóa nhóm khách hàng
    CustomerGroupResponse updateActiveStatus(
            Integer customerGroupId,
            Boolean isActive);
}
