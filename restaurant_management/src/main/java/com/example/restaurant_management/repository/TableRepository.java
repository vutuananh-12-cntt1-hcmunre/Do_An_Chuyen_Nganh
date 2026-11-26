
package com.example.restaurant_management.repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;

import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.restaurant_management.dto.Table;

@Repository
public class TableRepository {

    private final NamedParameterJdbcTemplate connection;

    public TableRepository(NamedParameterJdbcTemplate connection) {
        this.connection = connection;
    }

    // 1. Lấy danh sách bàn ăn
    public List<Table> findAll() {

        String sql = """
                SELECT
                    table_id AS tableId,
                    table_code AS tableCode,
                    capacity,
                    table_status AS tableStatus,
                    description,
                    is_active AS isActive,
                    created_at AS createdAt
                FROM restaurant_tables
                ORDER BY table_id ASC
                """;

        return connection.query(
                sql,
                new BeanPropertyRowMapper<>(Table.class)
        );
    }

    // 2. Tìm bàn theo ID
    public Table findById(Integer tableId) {

        String sql = """
                SELECT
                    table_id AS tableId,
                    table_code AS tableCode,
                    capacity,
                    table_status AS tableStatus,
                    description,
                    is_active AS isActive,
                    created_at AS createdAt
                FROM restaurant_tables
                WHERE table_id = :tableId
                """;

        List<Table> tables = connection.query(
                sql,
                Map.of("tableId", tableId),
                new BeanPropertyRowMapper<>(Table.class)
        );

        return tables.isEmpty() ? null : tables.get(0);
    }

    // 3. Kiểm tra mã bàn đã tồn tại
    public boolean existsByTableCode(String tableCode) {

        String sql = """
                SELECT COUNT(*)
                FROM restaurant_tables
                WHERE table_code = :tableCode
                """;

        Integer count = connection.queryForObject(
                sql,
                Map.of("tableCode", tableCode),
                Integer.class
        );

        return count != null && count > 0;
    }

    // 4. Kiểm tra mã bàn đã tồn tại, ngoại trừ bàn đang cập nhật
    public boolean existsByTableCodeExceptId(
            String tableCode,
            Integer tableId
    ) {

        String sql = """
                SELECT COUNT(*)
                FROM restaurant_tables
                WHERE table_code = :tableCode
                AND table_id <> :tableId
                """;

        Integer count = connection.queryForObject(
                sql,
                Map.of(
                        "tableCode", tableCode,
                        "tableId", tableId
                ),
                Integer.class
        );

        return count != null && count > 0;
    }

    // 5. Thêm bàn mới
    public Integer insert(Table table) {

        String sql = """
                INSERT INTO restaurant_tables (
                    table_code,
                    capacity,
                    table_status,
                    description
                )
                OUTPUT INSERTED.table_id
                VALUES (
                    :tableCode,
                    :capacity,
                    :tableStatus,
                    :description
                )
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("tableCode", table.getTableCode())
                .addValue("capacity", table.getCapacity())
                .addValue("tableStatus", table.getTableStatus())
                .addValue("description", table.getDescription());

        return connection.queryForObject(
                sql,
                params,
                Integer.class
        );
    }

    // 6. Cập nhật thông tin bàn
    public boolean update(Integer tableId, Table table) {

        String sql = """
                UPDATE restaurant_tables
                SET
                    table_code = :tableCode,
                    capacity = :capacity,
                    table_status = :tableStatus,
                    description = :description
                WHERE table_id = :tableId
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("tableId", tableId)
                .addValue("tableCode", table.getTableCode())
                .addValue("capacity", table.getCapacity())
                .addValue("tableStatus", table.getTableStatus())
                .addValue("description", table.getDescription());

        return connection.update(sql, params) > 0;
    }

    // 7. Vô hiệu hóa bàn
    public boolean deactivate(Integer tableId) {

        String sql = """
                UPDATE restaurant_tables
                SET is_active = 0
                WHERE table_id = :tableId
                """;

        return connection.update(
                sql,
                Map.of("tableId", tableId)
        ) > 0;
    }

    // 8. Kích hoạt bàn
    public boolean activate(Integer tableId) {

        String sql = """
                UPDATE restaurant_tables
                SET is_active = 1
                WHERE table_id = :tableId
                """;

        return connection.update(
                sql,
                Map.of("tableId", tableId)
        ) > 0;
    }

// 9. Tìm bàn phù hợp và còn trống trong khoảng thời gian đặt
public List<Table> findAvailableTables(
        Integer guestCount,
        LocalDateTime reservationTime,
        LocalDateTime reservationEndTime) {

    String sql = """
        SELECT
            t.table_id AS tableId,
            t.table_code AS tableCode,
            t.capacity,
            t.table_status AS tableStatus,
            t.description,
            t.is_active AS isActive,
            t.created_at AS createdAt
        FROM restaurant_tables t
        WHERE t.is_active = 1
            AND (
                t.table_status IS NULL
                OR t.table_status <> 'MAINTENANCE'
            )
            AND t.capacity >= :guestCount
            AND NOT EXISTS (
                SELECT 1
                FROM reservations r
                WHERE r.table_id = t.table_id
                    AND r.reservation_status IN (
                        'PENDING',
                        'CONFIRMED',
                        'SEATED'
                    )
                    AND r.reservation_time < :reservationEndTime
                    AND r.reservation_end_time > :reservationTime
            )
        ORDER BY t.capacity ASC, t.table_id ASC
        """;

    MapSqlParameterSource params = new MapSqlParameterSource()
            .addValue("guestCount", guestCount)
            .addValue("reservationTime", reservationTime)
            .addValue("reservationEndTime", reservationEndTime);

    return connection.query(
            sql,
            params,
            new BeanPropertyRowMapper<>(Table.class)
    );
}

}
