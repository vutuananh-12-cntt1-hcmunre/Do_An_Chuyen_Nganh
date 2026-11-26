
package com.example.restaurant_management.dto;

import java.time.LocalDateTime;

import jakarta.validation.constraints.Future;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

public class ReservationRequest {

    // Bàn được chọn, có thể để trống
    @Positive(message = "ID bàn không hợp lệ")
    private Integer tableId;

    // Thời gian bắt đầu đặt bàn
    @NotNull(message = "Thời gian đặt bàn không được để trống")
    @Future(message = "Thời gian đặt bàn phải ở tương lai")
    private LocalDateTime reservationTime;

    // Thời gian kết thúc đặt bàn
    @NotNull(message = "Thời gian kết thúc không được để trống")
    @Future(message = "Thời gian kết thúc phải ở tương lai")
    private LocalDateTime reservationEndTime;

    // Số lượng khách
    @NotNull(message = "Số lượng khách không được để trống")
    @Positive(message = "Số lượng khách phải lớn hơn 0")
    private Integer guestCount;

    // Ghi chú của khách hàng
    private String customerNote;

    public ReservationRequest() {
    }

    public Integer getTableId() {
        return tableId;
    }

    public void setTableId(Integer tableId) {
        this.tableId = tableId;
    }

    public LocalDateTime getReservationTime() {
        return reservationTime;
    }

    public void setReservationTime(LocalDateTime reservationTime) {
        this.reservationTime = reservationTime;
    }

    public LocalDateTime getReservationEndTime() {
        return reservationEndTime;
    }

    public void setReservationEndTime(LocalDateTime reservationEndTime) {
        this.reservationEndTime = reservationEndTime;
    }

    public Integer getGuestCount() {
        return guestCount;
    }

    public void setGuestCount(Integer guestCount) {
        this.guestCount = guestCount;
    }

    public String getCustomerNote() {
        return customerNote;
    }

    public void setCustomerNote(String customerNote) {
        this.customerNote = customerNote;
    }
}
