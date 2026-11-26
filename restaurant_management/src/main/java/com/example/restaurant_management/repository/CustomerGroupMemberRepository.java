
package com.example.restaurant_management.repository;

import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Timestamp;
import java.util.List;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.restaurant_management.dto.CustomerGroupMember;

@Repository
public class CustomerGroupMemberRepository {

    private final NamedParameterJdbcTemplate jdbcTemplate;

    public CustomerGroupMemberRepository(
            NamedParameterJdbcTemplate jdbcTemplate) {
        this.jdbcTemplate = jdbcTemplate;
    }

    private final RowMapper<CustomerGroupMember> rowMapper =
            new RowMapper<CustomerGroupMember>() {

        @Override
        public CustomerGroupMember mapRow(
                ResultSet rs, int rowNum) throws SQLException {

            CustomerGroupMember member =
                    new CustomerGroupMember();

            member.setUserId(rs.getInt("user_id"));

            member.setCustomerGroupId(
                    rs.getInt("customer_group_id"));

            member.setUsername(rs.getString("username"));

            member.setFullName(rs.getString("full_name"));

            member.setEmail(rs.getString("email"));

            Timestamp assignedAt =
                    rs.getTimestamp("assigned_at");

            member.setAssignedAt(
                    assignedAt != null
                            ? assignedAt.toLocalDateTime()
                            : null);

            return member;
        }
    };

    // Lấy danh sách khách hàng trong một nhóm
    public List<CustomerGroupMember> findByGroupId(
            Integer customerGroupId) {

        String sql = """
                SELECT
                    u.user_id,
                    ucg.customer_group_id,
                    u.username,
                    u.full_name,
                    u.email,
                    ucg.assigned_at
                FROM user_customer_groups ucg
                INNER JOIN users u
                    ON ucg.user_id = u.user_id
                INNER JOIN user_roles ur
                    ON u.user_id = ur.user_id
                INNER JOIN roles r
                    ON ur.role_id = r.role_id
                WHERE ucg.customer_group_id = :customerGroupId
                  AND r.role_name = 'CUSTOMER'
                ORDER BY ucg.assigned_at DESC
                """;

        MapSqlParameterSource params =
                new MapSqlParameterSource();

        params.addValue("customerGroupId", customerGroupId);

        return jdbcTemplate.query(sql, params, rowMapper);
    }

    // Lấy danh sách nhóm mà một khách hàng tham gia
    public List<CustomerGroupMember> findByUserId(
            Integer userId) {

        String sql = """
                SELECT
                    u.user_id,
                    ucg.customer_group_id,
                    u.username,
                    u.full_name,
                    u.email,
                    ucg.assigned_at
                FROM user_customer_groups ucg
                INNER JOIN users u
                    ON ucg.user_id = u.user_id
                INNER JOIN user_roles ur
                    ON u.user_id = ur.user_id
                INNER JOIN roles r
                    ON ur.role_id = r.role_id
                WHERE u.user_id = :userId
                  AND r.role_name = 'CUSTOMER'
                ORDER BY ucg.assigned_at DESC
                """;

        MapSqlParameterSource params =
                new MapSqlParameterSource();

        params.addValue("userId", userId);

        return jdbcTemplate.query(sql, params, rowMapper);
    }

    // Kiểm tra tài khoản có phải khách hàng không
    public boolean isCustomer(Integer userId) {

        String sql = """
                SELECT COUNT(*)
                FROM user_roles ur
                INNER JOIN roles r
                    ON ur.role_id = r.role_id
                WHERE ur.user_id = :userId
                  AND r.role_name = 'CUSTOMER'
                """;

        MapSqlParameterSource params =
                new MapSqlParameterSource();

        params.addValue("userId", userId);

        Integer count = jdbcTemplate.queryForObject(
                sql, params, Integer.class);

        return count != null && count > 0;
    }

    // Kiểm tra khách hàng đã thuộc nhóm chưa
    public boolean existsByUserIdAndGroupId(
            Integer userId, Integer customerGroupId) {

        String sql = """
                SELECT COUNT(*)
                FROM user_customer_groups
                WHERE user_id = :userId
                  AND customer_group_id = :customerGroupId
                """;

        MapSqlParameterSource params =
                new MapSqlParameterSource();

        params.addValue("userId", userId);
        params.addValue("customerGroupId", customerGroupId);

        Integer count = jdbcTemplate.queryForObject(
                sql, params, Integer.class);

        return count != null && count > 0;
    }

    // Gán khách hàng vào nhóm
    public int insert(Integer userId, Integer customerGroupId) {

        String sql = """
                INSERT INTO user_customer_groups (
                    user_id,
                    customer_group_id,
                    assigned_at
                )
                VALUES (
                    :userId,
                    :customerGroupId,
                    SYSDATETIME()
                )
                """;

        MapSqlParameterSource params =
                new MapSqlParameterSource();

        params.addValue("userId", userId);
        params.addValue("customerGroupId", customerGroupId);

        return jdbcTemplate.update(sql, params);
    }

    // Xóa khách hàng khỏi nhóm
    public int delete(Integer userId, Integer customerGroupId) {

        String sql = """
                DELETE FROM user_customer_groups
                WHERE user_id = :userId
                  AND customer_group_id = :customerGroupId
                """;

        MapSqlParameterSource params =
                new MapSqlParameterSource();

        params.addValue("userId", userId);
        params.addValue("customerGroupId", customerGroupId);

        return jdbcTemplate.update(sql, params);
    }
}
