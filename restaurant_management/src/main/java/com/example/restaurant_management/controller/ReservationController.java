
package com.example.restaurant_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.server.ResponseStatusException;

import com.example.restaurant_management.dto.ReservationRequest;
import com.example.restaurant_management.dto.ReservationResponse;
import com.example.restaurant_management.dto.User;
import com.example.restaurant_management.repository.UserRepository;
import com.example.restaurant_management.service.ReservationService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/reservations")
@Validated
public class ReservationController {

    private final ReservationService reservationService;
    private final UserRepository userRepository;

    public ReservationController(
            ReservationService reservationService,
            UserRepository userRepository) {

        this.reservationService = reservationService;
        this.userRepository = userRepository;
    }

    // Lấy tất cả lượt đặt bàn
    @GetMapping
    public ResponseEntity<List<ReservationResponse>> getAllReservations() {

        return ResponseEntity.ok(
                reservationService.getAllReservations()
        );
    }

    // Lấy danh sách đặt bàn của tài khoản đang đăng nhập
    @GetMapping("/my")
    public ResponseEntity<List<ReservationResponse>> getMyReservations() {

        Integer userId = getCurrentUserId();

        return ResponseEntity.ok(
                reservationService.getReservationsByUserId(userId)
        );
    }

    // Lấy thông tin đặt bàn theo ID
    @GetMapping("/{reservationId}")
    public ResponseEntity<ReservationResponse> getReservationById(
            @PathVariable Integer reservationId) {

        return ResponseEntity.ok(
                reservationService.getReservationById(reservationId)
        );
    }

    // Tạo lượt đặt bàn
    @PostMapping
    public ResponseEntity<Integer> createReservation(
            @Valid @RequestBody ReservationRequest request) {

        Integer reservationId =
                reservationService.createReservation(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(reservationId);
    }

    // Cập nhật thông tin đặt bàn
    @PutMapping("/{reservationId}")
    public ResponseEntity<String> updateReservation(
            @PathVariable Integer reservationId,
            @Valid @RequestBody ReservationRequest request) {

        checkReservationOwnership(reservationId);

        boolean result = reservationService.updateReservation(
                reservationId,
                request
        );

        if (!result) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cập nhật đặt bàn thất bại"
            );
        }

        return ResponseEntity.ok("Cập nhật đặt bàn thành công");
    }

    // Xác nhận đặt bàn
    @PatchMapping("/{reservationId}/confirm")
    public ResponseEntity<String> confirmReservation(
            @PathVariable Integer reservationId) {

        boolean result =
                reservationService.confirmReservation(reservationId);

        if (!result) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Xác nhận đặt bàn thất bại"
            );
        }

        return ResponseEntity.ok("Xác nhận đặt bàn thành công");
    }

    // Hủy đặt bàn
    @PatchMapping("/{reservationId}/cancel")
    public ResponseEntity<String> cancelReservation(
            @PathVariable Integer reservationId) {

        checkReservationOwnership(reservationId);

        boolean result =
                reservationService.cancelReservation(reservationId);

        if (!result) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Hủy đặt bàn thất bại"
            );
        }

        return ResponseEntity.ok("Hủy đặt bàn thành công");
    }

    // Xác nhận khách đã đến và nhận bàn
    @PatchMapping("/{reservationId}/seat")
    public ResponseEntity<String> seatReservation(
            @PathVariable Integer reservationId) {

        boolean result =
                reservationService.seatReservation(reservationId);

        if (!result) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Xử lý nhận bàn thất bại"
            );
        }

        return ResponseEntity.ok("Xác nhận khách đã nhận bàn thành công");
    }

    // Hoàn thành lượt đặt bàn
    @PatchMapping("/{reservationId}/complete")
    public ResponseEntity<String> completeReservation(
            @PathVariable Integer reservationId) {

        boolean result =
                reservationService.completeReservation(reservationId);

        if (!result) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Hoàn thành đặt bàn thất bại"
            );
        }

        return ResponseEntity.ok("Hoàn thành lượt đặt bàn thành công");
    }

    // Đánh dấu khách không đến
    @PatchMapping("/{reservationId}/no-show")
    public ResponseEntity<String> markNoShow(
            @PathVariable Integer reservationId) {

        boolean result =
                reservationService.markNoShow(reservationId);

        if (!result) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Cập nhật trạng thái thất bại"
            );
        }

        return ResponseEntity.ok(
                "Đã đánh dấu khách không đến"
        );
    }

    // Lấy ID người dùng đang đăng nhập
    private Integer getCurrentUserId() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Bạn chưa đăng nhập"
            );
        }

        String username = authentication.getName();

        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy tài khoản"
                ));

        return user.getUserId();
    }

    // Kiểm tra quyền sở hữu lượt đặt bàn
    private void checkReservationOwnership(Integer reservationId) {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null || !authentication.isAuthenticated()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Bạn chưa đăng nhập"
            );
        }

        boolean isStaff = authentication.getAuthorities()
                .stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN")
                        || authority.getAuthority().equals("ROLE_MANAGER")
                );

        // Admin và Manager được phép thao tác với mọi lượt đặt bàn
        if (isStaff) {
            return;
        }

        // Khách hàng chỉ được thao tác với lượt đặt bàn của mình
        Integer currentUserId = getCurrentUserId();

        ReservationResponse reservation =
                reservationService.getReservationById(reservationId);

        if (!currentUserId.equals(reservation.getUserId())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Bạn không có quyền thao tác với lượt đặt bàn này"
            );
        }
    }
}
