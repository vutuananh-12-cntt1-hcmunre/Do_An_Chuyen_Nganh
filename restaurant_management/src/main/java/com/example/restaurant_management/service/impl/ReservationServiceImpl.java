
package com.example.restaurant_management.service.impl;

import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.restaurant_management.dto.Reservation;
import com.example.restaurant_management.dto.ReservationRequest;
import com.example.restaurant_management.dto.ReservationResponse;
import com.example.restaurant_management.dto.Table;
import com.example.restaurant_management.dto.User;
import com.example.restaurant_management.repository.ReservationRepository;
import com.example.restaurant_management.repository.TableRepository;
import com.example.restaurant_management.repository.UserRepository;
import com.example.restaurant_management.service.ReservationService;

@Service
public class ReservationServiceImpl implements ReservationService {

    private final ReservationRepository reservationRepository;
    private final TableRepository tableRepository;
    private final UserRepository userRepository;

    public ReservationServiceImpl(
            ReservationRepository reservationRepository,
            TableRepository tableRepository,
            UserRepository userRepository) {

        this.reservationRepository = reservationRepository;
        this.tableRepository = tableRepository;
        this.userRepository = userRepository;
    }

    // Lấy tất cả lượt đặt bàn
    @Override
    public List<ReservationResponse> getAllReservations() {
        return reservationRepository.findAll();
    }

    // Lấy lượt đặt bàn theo ID
    @Override
    public ReservationResponse getReservationById(Integer reservationId) {

        ReservationResponse reservation =
                reservationRepository.findById(reservationId);

        if (reservation == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy lượt đặt bàn"
            );
        }

        return reservation;
    }

    // Lấy danh sách đặt bàn của một khách hàng
    @Override
    public List<ReservationResponse> getReservationsByUserId(Integer userId) {

        return reservationRepository.findByUserId(userId);
    }

    // Tạo mã đặt bàn
    private String generateReservationCode() {

        return "RES" + UUID.randomUUID()
                .toString()
                .substring(0, 8)
                .toUpperCase();
    }

    // Lấy thông tin người dùng đang đăng nhập
    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Bạn chưa đăng nhập"
            );
        }

        String username = authentication.getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy tài khoản"
                ));
    }

    // Kiểm tra thời gian đặt bàn
    private void validateReservationTime(ReservationRequest request) {

        if (!request.getReservationEndTime()
                .isAfter(request.getReservationTime())) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Thời gian kết thúc phải sau thời gian bắt đầu"
            );
        }
    }

    // Kiểm tra bàn đặt
    private void validateTable(
            Integer tableId,
            Integer guestCount,
            Integer reservationId,
            ReservationRequest request) {

        // Không chọn bàn cụ thể
        if (tableId == null) {
            return;
        }

        Table table = tableRepository.findById(tableId);

        if (table == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy bàn"
            );
        }

        if (!Boolean.TRUE.equals(table.getIsActive())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Bàn hiện không hoạt động"
            );
        }

        if ("MAINTENANCE".equals(table.getTableStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Bàn đang được bảo trì"
            );
        }

        if (guestCount > table.getCapacity()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Số lượng khách vượt quá sức chứa của bàn"
            );
        }

        boolean overlapping =
                reservationRepository.existsOverlappingReservation(
                        tableId,
                        request.getReservationTime(),
                        request.getReservationEndTime(),
                        reservationId
                );

        if (overlapping) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Bàn đã có lịch đặt trong khoảng thời gian này"
            );
        }
    }

    // Tạo đặt bàn
    @Override
    @Transactional
    public Integer createReservation(ReservationRequest request) {

        validateReservationTime(request);

        User currentUser = getCurrentUser();

        validateTable(
                request.getTableId(),
                request.getGuestCount(),
                null,
                request
        );

        Reservation reservation = new Reservation();

        reservation.setReservationCode(generateReservationCode());
        reservation.setUserId(currentUser.getUserId());
        reservation.setTableId(request.getTableId());
        reservation.setReservationTime(request.getReservationTime());
        reservation.setReservationEndTime(request.getReservationEndTime());
        reservation.setGuestCount(request.getGuestCount());
        reservation.setReservationStatus("PENDING");
        reservation.setCustomerNote(request.getCustomerNote());

        return reservationRepository.insert(reservation);
    }

    // Cập nhật đặt bàn
    @Override
    @Transactional
    public boolean updateReservation(
            Integer reservationId,
            ReservationRequest request) {

        ReservationResponse existing =
                getReservationById(reservationId);

        if (!"PENDING".equals(existing.getReservationStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Chỉ có thể cập nhật lượt đặt bàn đang chờ xác nhận"
            );
        }

        validateReservationTime(request);

        validateTable(
                request.getTableId(),
                request.getGuestCount(),
                reservationId,
                request
        );

        Reservation reservation = new Reservation();

        reservation.setTableId(request.getTableId());
        reservation.setReservationTime(request.getReservationTime());
        reservation.setReservationEndTime(request.getReservationEndTime());
        reservation.setGuestCount(request.getGuestCount());
        reservation.setCustomerNote(request.getCustomerNote());

        return reservationRepository.update(reservationId, reservation);
    }

    // Cập nhật trạng thái đặt bàn
    private boolean changeStatus(
            Integer reservationId,
            String currentStatus,
            String newStatus) {

        ReservationResponse reservation =
                getReservationById(reservationId);

        if (!currentStatus.equals(reservation.getReservationStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Trạng thái đặt bàn hiện tại không hợp lệ"
            );
        }

        return reservationRepository.updateStatus(
                reservationId,
                newStatus
        );
    }

    // Xác nhận đặt bàn
    @Override
    public boolean confirmReservation(Integer reservationId) {

        return changeStatus(
                reservationId,
                "PENDING",
                "CONFIRMED"
        );
    }

    // Hủy đặt bàn
    @Override
    public boolean cancelReservation(Integer reservationId) {

        ReservationResponse reservation =
                getReservationById(reservationId);

        String status = reservation.getReservationStatus();

        if (!"PENDING".equals(status)
                && !"CONFIRMED".equals(status)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Không thể hủy lượt đặt bàn ở trạng thái hiện tại"
            );
        }

        return reservationRepository.updateStatus(
                reservationId,
                "CANCELLED"
        );
    }

    // Xác nhận khách đã đến và nhận bàn
    @Override
    public boolean seatReservation(Integer reservationId) {

        return changeStatus(
                reservationId,
                "CONFIRMED",
                "SEATED"
        );
    }

    // Hoàn thành lượt đặt bàn
    @Override
    public boolean completeReservation(Integer reservationId) {

        return changeStatus(
                reservationId,
                "SEATED",
                "COMPLETED"
        );
    }

    // Đánh dấu khách không đến
    @Override
    public boolean markNoShow(Integer reservationId) {

        return changeStatus(
                reservationId,
                "CONFIRMED",
                "NO_SHOW"
        );
    }
}
