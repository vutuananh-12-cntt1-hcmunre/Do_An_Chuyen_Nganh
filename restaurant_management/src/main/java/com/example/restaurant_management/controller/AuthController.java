package com.example.restaurant_management.controller;

import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.ResponseStatus;
import org.springframework.web.bind.annotation.RestController;

import com.example.restaurant_management.dto.LoginRequest;
import com.example.restaurant_management.dto.LoginResponse;
import com.example.restaurant_management.dto.RegisterRequest;
import com.example.restaurant_management.service.AuthService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    // Đăng nhập
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @RequestBody LoginRequest request) {

        LoginResponse response = authService.login(request);

        return ResponseEntity.ok(response);
    }

    // Đăng ký tài khoản khách hàng
    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    public void register(
            @Valid @RequestBody RegisterRequest request) {

        authService.register(request);
    }

    // Quên mật khẩu — gửi mật khẩu tạm qua email (Gmail SMTP)
    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(
            @RequestBody Map<String, String> body) {

        String email = body != null ? body.get("email") : null;

        if (email == null || email.isBlank()) {
            return ResponseEntity.badRequest().body(
                Map.of("message", "Email không được để trống")
            );
        }

        authService.forgotPassword(email.trim());

        // Luôn trả message giống nhau (không lộ email có tồn tại hay không)
        return ResponseEntity.ok(
            Map.of(
                "message",
                "Nếu email tồn tại trong hệ thống, mật khẩu tạm thời đã được gửi. Vui lòng kiểm tra hộp thư (kể cả Spam)."
            )
        );
    }
}
