
package com.example.restaurant_management.dto;

import java.time.LocalDateTime;

public class ReservationResponse {

    private Integer reservationId;
    private String reservationCode;
    private Integer userId;
    private String username;
    private Integer tableId;
    private String tableCode;
    private LocalDateTime reservationTime;
    private LocalDateTime reservationEndTime;
    private Integer guestCount;
    private String reservationStatus;
    private String customerNote;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public ReservationResponse() {
    }

    public ReservationResponse(
            Integer reservationId,
            String reservationCode,
            Integer userId,
            String username,
            Integer tableId,
            String tableCode,
            LocalDateTime reservationTime,
            LocalDateTime reservationEndTime,
            Integer guestCount,
            String reservationStatus,
            String customerNote,
            LocalDateTime createdAt,
            LocalDateTime updatedAt
    ) {
        this.reservationId = reservationId;
        this.reservationCode = reservationCode;
        this.userId = userId;
        this.username = username;
        this.tableId = tableId;
        this.tableCode = tableCode;
        this.reservationTime = reservationTime;
        this.reservationEndTime = reservationEndTime;
        this.guestCount = guestCount;
        this.reservationStatus = reservationStatus;
        this.customerNote = customerNote;
        this.createdAt = createdAt;
        this.updatedAt = updatedAt;
    }

    public Integer getReservationId() {
        return reservationId;
    }

    public void setReservationId(Integer reservationId) {
        this.reservationId = reservationId;
    }

    public String getReservationCode() {
        return reservationCode;
    }

    public void setReservationCode(String reservationCode) {
        this.reservationCode = reservationCode;
    }

    public Integer getUserId() {
        return userId;
    }

    public void setUserId(Integer userId) {
        this.userId = userId;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
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

    public String getReservationStatus() {
        return reservationStatus;
    }

    public void setReservationStatus(String reservationStatus) {
        this.reservationStatus = reservationStatus;
    }

    public String getCustomerNote() {
        return customerNote;
    }

    public void setCustomerNote(String customerNote) {
        this.customerNote = customerNote;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
