
package com.example.restaurant_management.service;

import java.util.List;

import com.example.restaurant_management.dto.ReservationRequest;
import com.example.restaurant_management.dto.ReservationResponse;

public interface ReservationService {

    // 1. Lấy danh sách đặt bàn
    List<ReservationResponse> getAllReservations();

    // 2. Lấy thông tin đặt bàn theo ID
    ReservationResponse getReservationById(Integer reservationId);

    // 3. Lấy danh sách đặt bàn của khách hàng
    List<ReservationResponse> getReservationsByUserId(Integer userId);

    // 4. Tạo phiếu đặt bàn
    Integer createReservation(ReservationRequest request);

    // 5. Cập nhật thông tin đặt bàn
    boolean updateReservation(
            Integer reservationId,
            ReservationRequest request
    );

    // 6. Xác nhận đặt bàn
    boolean confirmReservation(Integer reservationId);

    // 7. Hủy đặt bàn
    boolean cancelReservation(Integer reservationId);

    // 8. Cập nhật trạng thái khách đã nhận bàn
    boolean seatReservation(Integer reservationId);

    // 9. Hoàn thành đặt bàn
    boolean completeReservation(Integer reservationId);

    // 10. Đánh dấu khách không đến
    boolean markNoShow(Integer reservationId);
}
