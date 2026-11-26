
package com.example.restaurant_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.restaurant_management.dto.CustomerGroupMember;
import com.example.restaurant_management.service.CustomerGroupMemberService;

@RestController
@RequestMapping("/api/customer-groups")
public class CustomerGroupMemberController {

    private final CustomerGroupMemberService customerGroupMemberService;

    public CustomerGroupMemberController(
            CustomerGroupMemberService customerGroupMemberService) {
        this.customerGroupMemberService = customerGroupMemberService;
    }

    // Lấy danh sách khách hàng thuộc một nhóm
    @GetMapping("/{customerGroupId}/members")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<CustomerGroupMember>> getMembersByGroupId(
            @PathVariable Integer customerGroupId) {

        return ResponseEntity.ok(
                customerGroupMemberService.getMembersByGroupId(customerGroupId));
    }

    // Lấy danh sách nhóm mà một khách hàng đang tham gia
    @GetMapping("/members/user/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER', 'EMPLOYEE')")
    public ResponseEntity<List<CustomerGroupMember>> getGroupsByUserId(
            @PathVariable Integer userId) {

        return ResponseEntity.ok(
                customerGroupMemberService.getGroupsByUserId(userId));
    }

    // Thêm khách hàng vào nhóm
    @PostMapping("/{customerGroupId}/members/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<CustomerGroupMember> assignCustomerToGroup(
            @PathVariable Integer customerGroupId,
            @PathVariable Integer userId) {

        CustomerGroupMember member =
                customerGroupMemberService.assignCustomerToGroup(
                        userId, customerGroupId);

        return ResponseEntity.status(HttpStatus.CREATED).body(member);
    }

    // Xóa khách hàng khỏi nhóm
    @DeleteMapping("/{customerGroupId}/members/{userId}")
    @PreAuthorize("hasAnyRole('ADMIN', 'MANAGER')")
    public ResponseEntity<Void> removeCustomerFromGroup(
            @PathVariable Integer customerGroupId,
            @PathVariable Integer userId) {

        customerGroupMemberService.removeCustomerFromGroup(
                userId, customerGroupId);

        return ResponseEntity.noContent().build();
    }
}
