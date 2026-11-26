
package com.example.restaurant_management.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.restaurant_management.dto.CustomerGroup;
import com.example.restaurant_management.dto.CustomerGroupResponse;
import com.example.restaurant_management.repository.CustomerGroupRepository;
import com.example.restaurant_management.service.CustomerGroupService;

@Service
public class CustomerGroupServiceImpl implements CustomerGroupService {

    private final CustomerGroupRepository customerGroupRepository;

    public CustomerGroupServiceImpl(
            CustomerGroupRepository customerGroupRepository) {
        this.customerGroupRepository = customerGroupRepository;
    }

    // Chuyển CustomerGroup thành CustomerGroupResponse
    private CustomerGroupResponse convertToResponse(
            CustomerGroup group) {

        return new CustomerGroupResponse(
                group.getCustomerGroupId(),
                group.getGroupName(),
                group.getDescription(),
                group.getIsActive(),
                group.getCreatedAt()
        );
    }

    // Lấy danh sách nhóm khách hàng
    @Override
    public List<CustomerGroupResponse> getAllCustomerGroups() {

        return customerGroupRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // Lấy nhóm khách hàng theo ID
    @Override
    public CustomerGroupResponse getCustomerGroupById(
            Integer customerGroupId) {

        CustomerGroup group =
                customerGroupRepository.findById(customerGroupId);

        if (group == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy nhóm khách hàng"
            );
        }

        return convertToResponse(group);
    }

    // Kiểm tra dữ liệu nhóm khách hàng
    private void validateCustomerGroup(CustomerGroup group) {

        if (group.getGroupName() == null
                || group.getGroupName().trim().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tên nhóm khách hàng không được để trống"
            );
        }

        if (group.getGroupName().trim().length() > 100) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tên nhóm khách hàng không được vượt quá 100 ký tự"
            );
        }

        if (group.getDescription() != null
                && group.getDescription().length() > 255) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mô tả không được vượt quá 255 ký tự"
            );
        }
    }

    // Tạo nhóm khách hàng
    @Override
    public CustomerGroupResponse createCustomerGroup(
            CustomerGroup group) {

        validateCustomerGroup(group);

        group.setGroupName(group.getGroupName().trim());

        if (customerGroupRepository.existsByGroupName(
                group.getGroupName())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Tên nhóm khách hàng đã tồn tại"
            );
        }

        group.setIsActive(true);

        Integer customerGroupId =
                customerGroupRepository.insert(group);

        if (customerGroupId == null) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Không thể tạo nhóm khách hàng"
            );
        }

        return getCustomerGroupById(customerGroupId);
    }

    // Cập nhật nhóm khách hàng
    @Override
    public CustomerGroupResponse updateCustomerGroup(
            Integer customerGroupId,
            CustomerGroup group) {

        CustomerGroup existingGroup =
                customerGroupRepository.findById(customerGroupId);

        if (existingGroup == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy nhóm khách hàng"
            );
        }

        validateCustomerGroup(group);

        group.setGroupName(group.getGroupName().trim());

        if (customerGroupRepository.existsByGroupNameAndIdNot(
                group.getGroupName(), customerGroupId)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Tên nhóm khách hàng đã tồn tại"
            );
        }

        group.setCustomerGroupId(customerGroupId);

        // Giữ trạng thái cũ nếu client không gửi isActive
        if (group.getIsActive() == null) {
            group.setIsActive(existingGroup.getIsActive());
        }

        customerGroupRepository.update(group);

        return getCustomerGroupById(customerGroupId);
    }

    // Kích hoạt / vô hiệu hóa nhóm khách hàng
    @Override
    public CustomerGroupResponse updateActiveStatus(
            Integer customerGroupId,
            Boolean isActive) {

        if (isActive == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Trạng thái không được để trống"
            );
        }

        CustomerGroup group =
                customerGroupRepository.findById(customerGroupId);

        if (group == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy nhóm khách hàng"
            );
        }

        customerGroupRepository.updateActiveStatus(
                customerGroupId, isActive);

        return getCustomerGroupById(customerGroupId);
    }
}
