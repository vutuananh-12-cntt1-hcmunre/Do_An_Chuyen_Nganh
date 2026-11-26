
package com.example.restaurant_management.dto;

import java.time.LocalDateTime;

public class CustomerGroup {

    private Integer customerGroupId;
    private String groupName;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public CustomerGroup() {
    }

    public CustomerGroup(Integer customerGroupId, String groupName,
            String description, Boolean isActive,
            LocalDateTime createdAt) {
        this.customerGroupId = customerGroupId;
        this.groupName = groupName;
        this.description = description;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }

    public Integer getCustomerGroupId() {
        return customerGroupId;
    }

    public void setCustomerGroupId(Integer customerGroupId) {
        this.customerGroupId = customerGroupId;
    }

    public String getGroupName() {
        return groupName;
    }

    public void setGroupName(String groupName) {
        this.groupName = groupName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Boolean getIsActive() {
        return isActive;
    }

    public void setIsActive(Boolean isActive) {
        this.isActive = isActive;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
