
package com.example.restaurant_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.restaurant_management.dto.CustomerGroup;
import com.example.restaurant_management.dto.CustomerGroupResponse;
import com.example.restaurant_management.service.CustomerGroupService;

@RestController
@RequestMapping("/api/customer-groups")
@CrossOrigin("*")
public class CustomerGroupController {

    private final CustomerGroupService customerGroupService;

    public CustomerGroupController(
            CustomerGroupService customerGroupService) {
        this.customerGroupService = customerGroupService;
    }

    // Lấy danh sách nhóm khách hàng
    @GetMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','EMPLOYEE')")
    public ResponseEntity<List<CustomerGroupResponse>>
            getAllCustomerGroups() {

        return ResponseEntity.ok(
                customerGroupService.getAllCustomerGroups()
        );
    }

    // Lấy nhóm khách hàng theo ID
    @GetMapping("/{customerGroupId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER','EMPLOYEE')")
    public ResponseEntity<CustomerGroupResponse>
            getCustomerGroupById(
                    @PathVariable Integer customerGroupId) {

        return ResponseEntity.ok(
                customerGroupService.getCustomerGroupById(
                        customerGroupId)
        );
    }

    // Tạo nhóm khách hàng
    @PostMapping
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<CustomerGroupResponse>
            createCustomerGroup(
                    @RequestBody CustomerGroup group) {

        CustomerGroupResponse response =
                customerGroupService.createCustomerGroup(group);

        return ResponseEntity.status(HttpStatus.CREATED)
                .body(response);
    }

    // Cập nhật nhóm khách hàng
    @PutMapping("/{customerGroupId}")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<CustomerGroupResponse>
            updateCustomerGroup(
                    @PathVariable Integer customerGroupId,
                    @RequestBody CustomerGroup group) {

        return ResponseEntity.ok(
                customerGroupService.updateCustomerGroup(
                        customerGroupId, group)
        );
    }

    // Kích hoạt nhóm khách hàng
    @PatchMapping("/{customerGroupId}/activate")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<CustomerGroupResponse>
            activateCustomerGroup(
                    @PathVariable Integer customerGroupId) {

        return ResponseEntity.ok(
                customerGroupService.updateActiveStatus(
                        customerGroupId, true)
        );
    }

    // Vô hiệu hóa nhóm khách hàng
    @PatchMapping("/{customerGroupId}/deactivate")
    @PreAuthorize("hasAnyRole('ADMIN','MANAGER')")
    public ResponseEntity<CustomerGroupResponse>
            deactivateCustomerGroup(
                    @PathVariable Integer customerGroupId) {

        return ResponseEntity.ok(
                customerGroupService.updateActiveStatus(
                        customerGroupId, false)
        );
    }
}
