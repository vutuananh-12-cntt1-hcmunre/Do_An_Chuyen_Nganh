
package com.example.restaurant_management.service;

import com.example.restaurant_management.dto.LoginRequest;
import com.example.restaurant_management.dto.LoginResponse;
import com.example.restaurant_management.dto.RegisterRequest;

public interface AuthService {

    LoginResponse login(LoginRequest request);

    void register(RegisterRequest request);
    void forgotPassword(String email);
}
