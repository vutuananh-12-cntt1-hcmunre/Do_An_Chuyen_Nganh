
package com.example.restaurant_management.repository;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.restaurant_management.dto.Reservation;
import com.example.restaurant_management.dto.ReservationResponse;

@Repository
public class ReservationRepository {

    private final NamedParameterJdbcTemplate connection;

    public ReservationRepository(
            NamedParameterJdbcTemplate connection
    ) {
        this.connection = connection;
    }

    // 1. Lấy danh sách phiếu đặt bàn
    public List<ReservationResponse> findAll() {

        String sql = """
                SELECT
                    r.reservation_id AS reservationId,
                    r.reservation_code AS reservationCode,
                    r.user_id AS userId,
                    u.username AS username,
                    r.table_id AS tableId,
                    t.table_code AS tableCode,
                    r.reservation_time AS reservationTime,
                    r.reservation_end_time AS reservationEndTime,
                    r.guest_count AS guestCount,
                    r.reservation_status AS reservationStatus,
                    r.customer_note AS customerNote,
                    r.created_at AS createdAt,
                    r.updated_at AS updatedAt
                FROM reservations r
                INNER JOIN users u
                    ON r.user_id = u.user_id
                LEFT JOIN restaurant_tables t
                    ON r.table_id = t.table_id
                ORDER BY r.reservation_id DESC
                """;

        return connection.query(
                sql,
                new BeanPropertyRowMapper<>(ReservationResponse.class)
        );
    }

    // 2. Tìm phiếu đặt bàn theo ID
    public ReservationResponse findById(Integer reservationId) {

        String sql = """
                SELECT
                    r.reservation_id AS reservationId,
                    r.reservation_code AS reservationCode,
                    r.user_id AS userId,
                    u.username AS username,
                    r.table_id AS tableId,
                    t.table_code AS tableCode,
                    r.reservation_time AS reservationTime,
                    r.reservation_end_time AS reservationEndTime,
                    r.guest_count AS guestCount,
                    r.reservation_status AS reservationStatus,
                    r.customer_note AS customerNote,
                    r.created_at AS createdAt,
                    r.updated_at AS updatedAt
                FROM reservations r
                INNER JOIN users u
                    ON r.user_id = u.user_id
                LEFT JOIN restaurant_tables t
                    ON r.table_id = t.table_id
                WHERE r.reservation_id = :reservationId
                """;

        List<ReservationResponse> reservations = connection.query(
                sql,
                Map.of("reservationId", reservationId),
                new BeanPropertyRowMapper<>(ReservationResponse.class)
        );

        return reservations.isEmpty() ? null : reservations.get(0);
    }

    // 3. Kiểm tra mã đặt bàn đã tồn tại
    public boolean existsByReservationCode(String reservationCode) {

        String sql = """
                SELECT COUNT(*)
                FROM reservations
                WHERE reservation_code = :reservationCode
                """;

        Integer count = connection.queryForObject(
                sql,
                Map.of("reservationCode", reservationCode),
                Integer.class
        );

        return count != null && count > 0;
    }

    // 4. Thêm phiếu đặt bàn
    public Integer insert(Reservation reservation) {

        String sql = """
                INSERT INTO reservations (
                    reservation_code,
                    user_id,
                    table_id,
                    reservation_time,
                    reservation_end_time,
                    guest_count,
                    reservation_status,
                    customer_note
                )
                OUTPUT INSERTED.reservation_id
                VALUES (
                    :reservationCode,
                    :userId,
                    :tableId,
                    :reservationTime,
                    :reservationEndTime,
                    :guestCount,
                    :reservationStatus,
                    :customerNote
                )
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("reservationCode", reservation.getReservationCode())
                .addValue("userId", reservation.getUserId())
                .addValue("tableId", reservation.getTableId())
                .addValue("reservationTime", reservation.getReservationTime())
                .addValue("reservationEndTime", reservation.getReservationEndTime())
                .addValue("guestCount", reservation.getGuestCount())
                .addValue("reservationStatus", reservation.getReservationStatus())
                .addValue("customerNote", reservation.getCustomerNote());

        return connection.queryForObject(
                sql,
                params,
                Integer.class
        );
    }

    // 5. Cập nhật thông tin phiếu đặt bàn
    public boolean update(
            Integer reservationId,
            Reservation reservation
    ) {

        String sql = """
                UPDATE reservations
                SET
                    table_id = :tableId,
                    reservation_time = :reservationTime,
                    reservation_end_time = :reservationEndTime,
                    guest_count = :guestCount,
                    customer_note = :customerNote,
                    updated_at = SYSDATETIME()
                WHERE reservation_id = :reservationId
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("reservationId", reservationId)
                .addValue("tableId", reservation.getTableId())
                .addValue("reservationTime", reservation.getReservationTime())
                .addValue("reservationEndTime", reservation.getReservationEndTime())
                .addValue("guestCount", reservation.getGuestCount())
                .addValue("customerNote", reservation.getCustomerNote());

        return connection.update(sql, params) > 0;
    }

    // 6. Kiểm tra bàn có bị trùng lịch đặt hay không
    public boolean existsOverlappingReservation(
            Integer tableId,
            LocalDateTime reservationTime,
            LocalDateTime reservationEndTime,
            Integer excludeReservationId
    ) {

        String sql = """
                SELECT COUNT(*)
                FROM reservations
                WHERE table_id = :tableId
                    AND reservation_status IN (
                        'PENDING',
                        'CONFIRMED',
                        'SEATED'
                    )
                    AND reservation_time < :reservationEndTime
                    AND reservation_end_time > :reservationTime
                    AND (
                        :excludeReservationId IS NULL
                        OR reservation_id <> :excludeReservationId
                    )
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("tableId", tableId)
                .addValue("reservationTime", reservationTime)
                .addValue("reservationEndTime", reservationEndTime)
                .addValue("excludeReservationId", excludeReservationId);

        Integer count = connection.queryForObject(
                sql,
                params,
                Integer.class
        );

        return count != null && count > 0;
    }

    // 7. Cập nhật trạng thái đặt bàn
    public boolean updateStatus(
            Integer reservationId,
            String reservationStatus
    ) {

        String sql = """
                UPDATE reservations
                SET
                    reservation_status = :reservationStatus,
                    updated_at = SYSDATETIME()
                WHERE reservation_id = :reservationId
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("reservationId", reservationId)
                .addValue("reservationStatus", reservationStatus);

        return connection.update(sql, params) > 0;
    }
    public List<ReservationResponse> findByUserId(Integer userId) {

    String sql = """
        SELECT
            r.reservation_id AS reservationId,
            r.reservation_code AS reservationCode,
            r.user_id AS userId,
            u.username AS username,
            r.table_id AS tableId,
            t.table_code AS tableCode,
            r.reservation_time AS reservationTime,
            r.reservation_end_time AS reservationEndTime,
            r.guest_count AS guestCount,
            r.reservation_status AS reservationStatus,
            r.customer_note AS customerNote,
            r.created_at AS createdAt,
            r.updated_at AS updatedAt
        FROM reservations r
        INNER JOIN users u
            ON r.user_id = u.user_id
        LEFT JOIN restaurant_tables t
            ON r.table_id = t.table_id
        WHERE r.user_id = :userId
        ORDER BY r.reservation_time DESC
        """;

    Map<String, Object> params = new HashMap<>();
    params.put("userId", userId);

    return connection.query(
        sql,
        params,
        new BeanPropertyRowMapper<>(ReservationResponse.class)
    );
}
}
