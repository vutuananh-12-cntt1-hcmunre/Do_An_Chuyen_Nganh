
package com.example.restaurant_management.service.impl;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.restaurant_management.dto.CustomerGroup;
import com.example.restaurant_management.dto.CustomerGroupMember;
import com.example.restaurant_management.repository.CustomerGroupMemberRepository;
import com.example.restaurant_management.repository.CustomerGroupRepository;
import com.example.restaurant_management.service.CustomerGroupMemberService;

@Service
public class CustomerGroupMemberServiceImpl
        implements CustomerGroupMemberService {

    private final CustomerGroupMemberRepository memberRepository;
    private final CustomerGroupRepository groupRepository;

    public CustomerGroupMemberServiceImpl(
            CustomerGroupMemberRepository memberRepository,
            CustomerGroupRepository groupRepository) {

        this.memberRepository = memberRepository;
        this.groupRepository = groupRepository;
    }

    // Kiểm tra nhóm khách hàng tồn tại
    private CustomerGroup validateGroup(Integer customerGroupId) {

        CustomerGroup group =
                groupRepository.findById(customerGroupId);

        if (group == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy nhóm khách hàng"
            );
        }

        return group;
    }

    // Lấy danh sách khách hàng trong một nhóm
    @Override
    public List<CustomerGroupMember> getMembersByGroupId(
            Integer customerGroupId) {

        validateGroup(customerGroupId);

        return memberRepository.findByGroupId(customerGroupId);
    }

    // Lấy danh sách nhóm của một khách hàng
    @Override
    public List<CustomerGroupMember> getGroupsByUserId(
            Integer userId) {

        if (!memberRepository.isCustomer(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tài khoản không phải khách hàng"
            );
        }

        return memberRepository.findByUserId(userId);
    }

    // Gán khách hàng vào nhóm
    @Override
    public CustomerGroupMember assignCustomerToGroup(
            Integer userId,
            Integer customerGroupId) {

        CustomerGroup group = validateGroup(customerGroupId);

        if (!Boolean.TRUE.equals(group.getIsActive())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Không thể gán khách hàng vào nhóm đã bị vô hiệu hóa"
            );
        }

        if (!memberRepository.isCustomer(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tài khoản không phải khách hàng"
            );
        }

        if (memberRepository.existsByUserIdAndGroupId(
                userId, customerGroupId)) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Khách hàng đã thuộc nhóm này"
            );
        }

        memberRepository.insert(userId, customerGroupId);

        List<CustomerGroupMember> members =
                memberRepository.findByGroupId(customerGroupId);

        return members.stream()
                .filter(member -> member.getUserId().equals(userId))
                .findFirst()
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.INTERNAL_SERVER_ERROR,
                        "Không thể lấy thông tin thành viên sau khi gán"
                ));
    }

    // Xóa khách hàng khỏi nhóm
    @Override
    public void removeCustomerFromGroup(
            Integer userId,
            Integer customerGroupId) {

        validateGroup(customerGroupId);

        if (!memberRepository.isCustomer(userId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Tài khoản không phải khách hàng"
            );
        }

        if (!memberRepository.existsByUserIdAndGroupId(
                userId, customerGroupId)) {

            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Khách hàng không thuộc nhóm này"
            );
        }

        memberRepository.delete(userId, customerGroupId);
    }
}
