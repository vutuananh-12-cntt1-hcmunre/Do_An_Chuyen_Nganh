package com.example.restaurant_management.repository;

import java.util.List;

import org.springframework.jdbc.core.BeanPropertyRowMapper;
import org.springframework.jdbc.core.namedparam.MapSqlParameterSource;
import org.springframework.jdbc.core.namedparam.NamedParameterJdbcTemplate;
import org.springframework.stereotype.Repository;

import com.example.restaurant_management.dto.Category;

@Repository
public class CategoryRepository {
    private final NamedParameterJdbcTemplate connection;
    public CategoryRepository(NamedParameterJdbcTemplate connection){
        this.connection=connection;
    }
public List<Category> findAll(){
    String sql="select category_id as categoryId, category_name as categoryName, description, is_active as isActive, created_at as createdAt from categories order by category_id desc";
    return connection.query(sql, new BeanPropertyRowMapper<>(Category.class));
}
public Category findById(Integer categoryId){
    String sql= "select category_id as categoryId, category_name as categoryName, description, is_active as isActive, created_at as createdAt from categories where category_id = :categoryId";
    var params = new MapSqlParameterSource().addValue("categoryId", categoryId);
    List<Category> categories = connection.query(sql,params, new BeanPropertyRowMapper<>(Category.class));
    return categories.isEmpty() ? null : categories.get(0);
}
public boolean existsByCategoryName(String categoryName){
    String sql="select count(*) from categories where category_name = :categoryName";
    var params = new MapSqlParameterSource().addValue("categoryName", categoryName);
    Integer count = connection.queryForObject(sql, params, Integer.class);
    return count !=null && count>0;
}
public Integer insert (Category category){
    String sql="insert into categories(category_name, description) output inserted.category_id values(:categoryName, :description)";
    var params = new MapSqlParameterSource().addValue("categoryName", category.getCategoryName()).addValue("description",category.getDescription());
    return connection.queryForObject(sql, params, Integer.class);
}
public boolean update (Integer categoryId, Category category){
    String sql = "update categories set category_name=:categoryName, description=:description where category_id= :categoryId";
    var params = new MapSqlParameterSource().addValue("categoryId", categoryId).addValue("categoryName", category.getCategoryName()).addValue("description", category.getDescription());
    return connection.update(sql, params)>0;
}
public boolean deactivate (Integer categoryId){
    String sql = "update categories set is_active = 0 where category_id=:categoryId";
    var params = new MapSqlParameterSource().addValue("categoryId", categoryId);
    return connection.update(sql,params)>0;
}
public boolean activate(Integer categoryId){
    String sql= "update categories set is_active=1 where category_id = :categoryId";
    var params = new MapSqlParameterSource().addValue("categoryId", categoryId);
    return connection.update(sql,params)>0;
}
}
