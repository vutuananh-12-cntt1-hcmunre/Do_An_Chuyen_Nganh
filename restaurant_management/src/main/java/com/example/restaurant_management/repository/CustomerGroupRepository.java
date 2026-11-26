
package com.example.restaurant_management.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;
import org.springframework.stereotype.Repository;

import com.example.restaurant_management.dto.CustomerGroup;

@Repository
public class CustomerGroupRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public CustomerGroupRepository(
            NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<CustomerGroup> rowMapper =
            new RowMapper<CustomerGroup>() {

        @Override
        public CustomerGroup mapRow(ResultSet rs, int rowNum)
                throws SQLException {

            CustomerGroup group = new CustomerGroup();

            group.setCustomerGroupId(
                    rs.getInt("customer_group_id"));

            group.setGroupName(
                    rs.getString("group_name"));

            group.setDescription(
                    rs.getString("description"));

            group.setIsActive(
                    rs.getBoolean("is_active"));

            Timestamp createdAt =
                    rs.getTimestamp("created_at");

            group.setCreatedAt(
                    createdAt != null
                            ? createdAt.toLocalDateTime()
                            : null);

            return group;
        }
    };

    // Lấy danh sách nhóm khách hàng
    public List<CustomerGroup> findAll() {

        String sql = """
                SELECT *
                FROM customer_groups
                ORDER BY customer_group_id DESC
                """;

        return jdbcTemplate.query(sql, rowMapper);
    }

    // Tìm nhóm khách hàng theo ID
    public CustomerGroup findById(Integer customerGroupId) {

        String sql = """
                SELECT *
                FROM customer_groups
                WHERE customer_group_id = :customerGroupId
                """;

        MapSqlParameterSource params =
                new MapSqlParameterSource();

        params.addValue("customerGroupId", customerGroupId);

        List<CustomerGroup> results =
                jdbcTemplate.query(sql, params, rowMapper);

        return results.isEmpty() ? null : results.get(0);
    }

    // Kiểm tra tên nhóm đã tồn tại
    public boolean existsByGroupName(String groupName) {

        String sql = """
                SELECT COUNT(*)
                FROM customer_groups
                WHERE group_name = :groupName
                """;

        MapSqlParameterSource params =
                new MapSqlParameterSource();

        params.addValue("groupName", groupName);

        Integer count = jdbcTemplate.queryForObject(
                sql, params, Integer.class);

        return count != null && count > 0;
    }

    // Kiểm tra tên nhóm trùng với nhóm khác khi cập nhật
    public boolean existsByGroupNameAndIdNot(
            String groupName, Integer customerGroupId) {

        String sql = """
                SELECT COUNT(*)
                FROM customer_groups
                WHERE group_name = :groupName
                  AND customer_group_id <> :customerGroupId
                """;

        MapSqlParameterSource params =
                new MapSqlParameterSource();

        params.addValue("groupName", groupName);
        params.addValue("customerGroupId", customerGroupId);

        Integer count = jdbcTemplate.queryForObject(
                sql, params, Integer.class);

        return count != null && count > 0;
    }

    // Thêm nhóm khách hàng
    public Integer insert(CustomerGroup group) {

        String sql = """
                INSERT INTO customer_groups (
                    group_name,
                    description,
                    is_active
                )
                VALUES (
                    :groupName,
                    :description,
                    :isActive
                )
                """;

        MapSqlParameterSource params =
                new MapSqlParameterSource();

        params.addValue("groupName", group.getGroupName());
        params.addValue("description", group.getDescription());
        params.addValue("isActive", group.getIsActive());

        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(
                sql,
                params,
                keyHolder,
                new String[]{"customer_group_id"}
        );

        Number key = keyHolder.getKey();

        return key != null ? key.intValue() : null;
    }

    // Cập nhật nhóm khách hàng
    public int update(CustomerGroup group) {

        String sql = """
                UPDATE customer_groups
                SET group_name = :groupName,
                    description = :description,
                    is_active = :isActive
                WHERE customer_group_id = :customerGroupId
                """;

        MapSqlParameterSource params =
                new MapSqlParameterSource();

        params.addValue("customerGroupId",
                group.getCustomerGroupId());

        params.addValue("groupName", group.getGroupName());
        params.addValue("description", group.getDescription());
        params.addValue("isActive", group.getIsActive());

        return jdbcTemplate.update(sql, params);
    }

    // Cập nhật trạng thái nhóm khách hàng
    public int updateActiveStatus(
            Integer customerGroupId, Boolean isActive) {

        String sql = """
                UPDATE customer_groups
                SET is_active = :isActive
                WHERE customer_group_id = :customerGroupId
                """;

        MapSqlParameterSource params =
                new MapSqlParameterSource();

        params.addValue("customerGroupId", customerGroupId);
        params.addValue("isActive", isActive);

        return jdbcTemplate.update(sql, params);
    }
}
