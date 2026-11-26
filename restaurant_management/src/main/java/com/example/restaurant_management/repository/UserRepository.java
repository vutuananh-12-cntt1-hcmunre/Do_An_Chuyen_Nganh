package com.example.restaurant_management.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.namedparam.BeanPropertySqlParameterSource;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.restaurant_management.dto.User;

@Repository
public class UserRepository {
    private final NamedParameterJdbcTemplate connection;
    public UserRepository(NamedParameterJdbcTemplate connection) {
        this.connection = connection;
    }
    private final BeanPropertyRowMapper<User> mapper = new BeanPropertyRowMapper<>(User.class);
    public List<User> findAll(){
        String sql = "select user_id as userId, username, email, password_hash as passwordHash, full_name as fullName, phone, is_active as isActive from users order by user_id desc";
        return connection.query(sql, mapper);
    }
    public Optional<User> findById(Integer userId){
        String sql ="select user_id as userId, username,email, password_hash as passwordHash, full_name as fullName, phone, is_active as isActive from users where user_id=:userId";
        var params = new MapSqlParameterSource().addValue("userId", userId);
        List<User> result = connection.query(sql, params, mapper);
        return result.stream().findFirst();
    }
    public Optional<User> findByUsername(String username){
        String sql="select user_id as userId, username, email, password_hash as passwordHash, full_name as fullName,phone, is_active as isActive from users where username =:username";
        var params= new MapSqlParameterSource().addValue("username", username);
        List<User> result = connection.query(sql, params, mapper);
        return result.stream().findFirst();
    }
    public Optional<User> findByEmail(String email){
        String sql="select user_id as userId, username, email, password_hash as passwordHash, full_name as fullName, phone, is_active as isActive from users where email =:email";
        var params= new MapSqlParameterSource().addValue("email", email);
        List<User> result = connection.query(sql, params, mapper);
        return result.stream().findFirst();
    }
    public boolean existsByUsername(String username){
        String sql="select count(*) from users where username=:username";
        var params=new MapSqlParameterSource().addValue("username",username);
        Integer count=connection.queryForObject(sql, params, Integer.class);
        return count!=null && count>0;
    }
    public boolean existsByEmail(String email){
        String sql="select count(*) from users where email=:email";
        var params=new MapSqlParameterSource().addValue("email", email);
        Integer count=connection.queryForObject(sql,params,Integer.class);
        return count!=null && count>0;
    }
    public Integer insert(User obj){
        String sql="insert into users(username,email,password_hash,full_name,phone, is_active) output inserted.user_id values(:username,:email,:passwordHash,:fullName,:phone,:isActive)";
        var params=new BeanPropertySqlParameterSource(obj);
        if(obj.getIsActive()==null){
            params=new BeanPropertySqlParameterSource(obj);
            params.registerSqlType("isActive", java.sql.Types.BIT);
        }
        var insertParams = new MapSqlParameterSource()
                .addValue("username", obj.getUsername())
                .addValue("email", obj.getEmail())
                .addValue("passwordHash", obj.getPasswordHash())
                .addValue("fullName", obj.getFullName())
                .addValue("phone", obj.getPhone())
                .addValue("isActive", obj.getIsActive() !=null ? obj.getIsActive() :true);
        return connection.queryForObject(sql, insertParams, Integer.class);
        }
    public int edit(User obj){
        String sql="update users set username=:username, email=:email, full_name=:fullName, phone=:phone, updated_at=SYSDATETIME() where user_id=:userId";
        return connection.update(sql, new BeanPropertySqlParameterSource(obj));
        }
    public int changePassword(Integer userId, String passwordHash){
        String sql="update users set password_hash=:passwordHash, updated_at=SYSDATETIME() where user_id=:userId";
        var params=new MapSqlParameterSource()
                .addValue("userId", userId)
                .addValue("passwordHash", passwordHash);
        return connection.update(sql, params);
    }
    public int deactivate(Integer userId){
        String sql="update users set is_active=0, updated_at=SYSDATETIME() where user_id = :userId";
        var params = new MapSqlParameterSource().addValue("userId", userId);
        return connection.update(sql, params);
    }
    public int activate(Integer userId){
        String sql = "update users set is_active=1,updated_at=SYSDATETIME() where user_id=:userId";
        var params= new MapSqlParameterSource().addValue("userId", userId);
        return connection.update(sql, params);
    }
    public List<String> findRolesByUserId(Integer userId){
        String sql="select role_name from roles inner join user_roles on roles.role_id = user_roles.role_id where user_roles.user_id= :userId";
        var params = new MapSqlParameterSource().addValue("userId",userId);
        return connection.queryForList(sql,params, String.class);
    }

public int assignRole(Integer userId, Integer roleId) {
    String sql = """
            INSERT INTO user_roles (user_id, role_id)
            VALUES (:userId, :roleId)
            """;

    var params = new MapSqlParameterSource()
            .addValue("userId", userId)
            .addValue("roleId", roleId);

    return connection.update(sql, params);
}

    }

