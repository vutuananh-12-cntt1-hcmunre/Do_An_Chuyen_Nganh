package com.example.restaurant_management.service;
import java.util.List;

import com.example.restaurant_management.dto.User;
import com.example.restaurant_management.dto.UserResponse;

public interface UserService {
    List<UserResponse> getAllUsers();
    UserResponse getUserById(Integer userId);
    UserResponse getUserByUsername(String username);
    Integer createUser(User user);
    boolean updateUser (Integer userId, User user);
    boolean deactivateUser(Integer userId);
    boolean activateUser(Integer userId);
}
