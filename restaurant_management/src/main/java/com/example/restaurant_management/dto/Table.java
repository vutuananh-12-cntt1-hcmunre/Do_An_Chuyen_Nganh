
package com.example.restaurant_management.dto;

import java.time.LocalDateTime;

public class Table {

    private Integer tableId;
    private String tableCode;
    private Integer capacity;
    private String tableStatus;
    private String description;
    private Boolean isActive;
    private LocalDateTime createdAt;

    public Table() {
    }

    public Table(
            Integer tableId,
            String tableCode,
            Integer capacity,
            String tableStatus,
            String description,
            Boolean isActive,
            LocalDateTime createdAt
    ) {
        this.tableId = tableId;
        this.tableCode = tableCode;
        this.capacity = capacity;
        this.tableStatus = tableStatus;
        this.description = description;
        this.isActive = isActive;
        this.createdAt = createdAt;
    }

    public Integer getTableId() {
        return tableId;
    }

    public void setTableId(Integer tableId) {
        this.tableId = tableId;
    }

    public String getTableCode() {
        return tableCode;
    }

    public void setTableCode(String tableCode) {
        this.tableCode = tableCode;
    }

    public Integer getCapacity() {
        return capacity;
    }

    public void setCapacity(Integer capacity) {
        this.capacity = capacity;
    }

    public String getTableStatus() {
        return tableStatus;
    }

    public void setTableStatus(String tableStatus) {
        this.tableStatus = tableStatus;
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
