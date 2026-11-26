
package com.example.restaurant_management.dto;

import jakarta.validation.constraints.Max;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

public class TableRequest {

    @NotBlank(message = "Mã bàn không được để trống")
    @Size(max = 20, message = "Mã bàn không được vượt quá 20 ký tự")
    private String tableCode;

    @NotNull(message = "Sức chứa không được để trống")
    @Min(value = 1, message = "Sức chứa tối thiểu là 1 người")
    @Max(value = 15, message = "Sức chứa tối đa là 15 người")
    private Integer capacity;

    @NotBlank(message = "Trạng thái bàn không được để trống")
    @Pattern(
        regexp = "AVAILABLE|OCCUPIED|RESERVED|MAINTENANCE",
        message = "Trạng thái bàn không hợp lệ"
    )
    private String tableStatus;

    @Size(max = 500, message = "Mô tả không được vượt quá 500 ký tự")
    private String description;

    public TableRequest() {
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
}
