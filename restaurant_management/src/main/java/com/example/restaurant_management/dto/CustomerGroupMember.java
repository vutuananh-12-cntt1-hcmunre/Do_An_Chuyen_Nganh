
package com.example.restaurant_management.dto;

import java.time.LocalDateTime;

public class CustomerGroupMember {

    private Integer userId;
    private Integer customerGroupId;
    private String username;
    private String fullName;
    private String email;
    private LocalDateTime assignedAt;

    public CustomerGroupMember() {
    }

    public CustomerGroupMember(
            Integer userId,
            Integer customerGroupId,
            String username,
            String fullName,
            String email,
            LocalDateTime assignedAt) {

        this.userId = userId;
        this.customerGroupId = customerGroupId;
        this.username = username;
        this.fullName = fullName;
        this.email = email;
        this.assignedAt = assignedAt;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public Integer getCustomerGroupId() {
        return customerGroupId;
    }

    public void setCustomerGroupId(Integer customerGroupId) {
        this.customerGroupId = customerGroupId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getFullName() {
        return fullName;
    }

    public void setFullName(String fullName) {
        this.fullName = fullName;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public LocalDateTime getAssignedAt() {
        return assignedAt;
    }

    public void setAssignedAt(LocalDateTime assignedAt) {
        this.assignedAt = assignedAt;
    }
}
