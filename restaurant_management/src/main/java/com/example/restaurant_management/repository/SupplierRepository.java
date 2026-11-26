package com.example.restaurant_management.repository;

import java.util.List;
import java.util.Map;
import java.util.Optional;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.example.restaurant_management.dto.Supplier;

@Repository
public class SupplierRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public SupplierRepository(NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    // Ánh xạ dữ liệu từ SQL Server sang Supplier
    private final RowMapper<Supplier> rowMapper = (rs, rowNum) -> {
        Supplier supplier = new Supplier();

        supplier.setSupplierId(rs.getInt("supplier_id"));
        supplier.setSupplierCode(rs.getString("supplier_code"));
        supplier.setSupplierName(rs.getString("supplier_name"));
        supplier.setPhone(rs.getString("phone"));
        supplier.setEmail(rs.getString("email"));
        supplier.setAddress(rs.getString("address"));
        supplier.setIsActive(rs.getBoolean("is_active"));
        supplier.setCreatedAt(
                rs.getTimestamp("created_at").toLocalDateTime());

        return supplier;
    };

    // Lấy danh sách nhà cung cấp
    public List<Supplier> findAll() {
        String sql = """
                SELECT *
                FROM suppliers
                ORDER BY supplier_id DESC
                """;

        return jdbcTemplate.query(sql, rowMapper);
    }

    // Tìm nhà cung cấp theo ID
    public Optional<Supplier> findById(Integer supplierId) {
        String sql = """
                SELECT *
                FROM suppliers
                WHERE supplier_id = :supplierId
                """;

        List<Supplier> results = jdbcTemplate.query(
                sql,
                Map.of("supplierId", supplierId),
                rowMapper
        );

        return results.stream().findFirst();
    }

    // Kiểm tra tên nhà cung cấp đã tồn tại
    public boolean existsBySupplierName(String supplierName) {
        String sql = """
                SELECT COUNT(*)
                FROM suppliers
                WHERE supplier_name = :supplierName
                """;

        Integer count = jdbcTemplate.queryForObject(
                sql,
                Map.of("supplierName", supplierName),
                Integer.class
        );

        return count != null && count > 0;
    }

    // Kiểm tra tên trùng với nhà cung cấp khác
    public boolean existsBySupplierNameAndIdNot(
            String supplierName, Integer supplierId) {

        String sql = """
                SELECT COUNT(*)
                FROM suppliers
                WHERE supplier_name = :supplierName
                  AND supplier_id <> :supplierId
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("supplierName", supplierName)
                .addValue("supplierId", supplierId);

        Integer count = jdbcTemplate.queryForObject(
                sql, params, Integer.class);

        return count != null && count > 0;
    }

    // Thêm nhà cung cấp
    public Integer insert(Supplier supplier) {
        String sql = """
                INSERT INTO suppliers (
                    supplier_code,
                    supplier_name,
                    phone,
                    email,
                    address,
                    is_active
                )
                VALUES (
                    :supplierCode,
                    :supplierName,
                    :phone,
                    :email,
                    :address,
                    :isActive
                )
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("supplierCode", supplier.getSupplierCode())
                .addValue("supplierName", supplier.getSupplierName())
                .addValue("phone", supplier.getPhone())
                .addValue("email", supplier.getEmail())
                .addValue("address", supplier.getAddress())
                .addValue("isActive", supplier.getIsActive());

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(
                sql,
                params,
                keyHolder,
                new String[]{"supplier_id"}
        );

        return keyHolder.getKey().intValue();
    }

    // Cập nhật thông tin nhà cung cấp
    public void update(Integer supplierId, Supplier supplier) {
        String sql = """
                UPDATE suppliers
                SET supplier_name = :supplierName,
                    phone = :phone,
                    email = :email,
                    address = :address
                WHERE supplier_id = :supplierId
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("supplierId", supplierId)
                .addValue("supplierName", supplier.getSupplierName())
                .addValue("phone", supplier.getPhone())
                .addValue("email", supplier.getEmail())
                .addValue("address", supplier.getAddress());

        jdbcTemplate.update(sql, params);
    }

    // Kích hoạt / ngừng hoạt động nhà cung cấp
    public void updateActiveStatus(
            Integer supplierId, Boolean isActive) {

        String sql = """
                UPDATE suppliers
                SET is_active = :isActive
                WHERE supplier_id = :supplierId
                """;

        MapSqlParameterSource params = new MapSqlParameterSource()
                .addValue("supplierId", supplierId)
                .addValue("isActive", isActive);

        jdbcTemplate.update(sql, params);
    }
}
