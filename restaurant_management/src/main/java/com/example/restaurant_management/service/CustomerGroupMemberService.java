
package com.example.restaurant_management.service;

import java.util.List;

import com.example.restaurant_management.dto.CustomerGroupMember;

public interface CustomerGroupMemberService {

    // Lấy danh sách khách hàng trong một nhóm
    List<CustomerGroupMember> getMembersByGroupId(
            Integer customerGroupId);

    // Lấy danh sách nhóm của một khách hàng
    List<CustomerGroupMember> getGroupsByUserId(
            Integer userId);

    // Gán khách hàng vào nhóm
    CustomerGroupMember assignCustomerToGroup(
            Integer userId,
            Integer customerGroupId);

    // Xóa khách hàng khỏi nhóm
    void removeCustomerFromGroup(
            Integer userId,
            Integer customerGroupId);
}
