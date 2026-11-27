package com.example.restaurant_management.service.impl;

import java.security.SecureRandom;
import java.util.List;
import java.util.Optional;

import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.restaurant_management.dto.LoginRequest;
import com.example.restaurant_management.dto.LoginResponse;
import com.example.restaurant_management.dto.RegisterRequest;
import com.example.restaurant_management.dto.User;
import com.example.restaurant_management.repository.UserRepository;
import com.example.restaurant_management.security.JwtService;
import com.example.restaurant_management.service.AuthService;
import com.example.restaurant_management.service.EmailService;

@Service
public class AuthServiceImpl implements AuthService {

    private static final String TEMP_PASSWORD_CHARS =
        "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789";

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final EmailService emailService;
    private final SecureRandom secureRandom = new SecureRandom();

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService,
            EmailService emailService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.emailService = emailService;
    }

    @Override
    public LoginResponse login(LoginRequest request) {

        User user = userRepository.findByUsername(request.getUsername())
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "username hoặc password không tồn tại"));

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Tài khoản đã bị khóa");
        }

        if (!passwordEncoder.matches(
                request.getPassword(),
                user.getPasswordHash())) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "username hoặc mật khẩu không chính xác");
        }

        List<String> roles =
                userRepository.findRolesByUserId(user.getUserId());

        String token = jwtService.generateToken(
                user.getUserId(),
                user.getUsername(),
                roles);

        LoginResponse response = new LoginResponse();
        response.setUserId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setFullName(user.getFullName());
        response.setRoles(roles);
        response.setToken(token);
        response.setTokenType("Bearer");

        return response;
    }

    @Override
    @Transactional
    public void register(RegisterRequest request) {

        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username đã tồn tại");
        }

        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email đã được sử dụng");
        }

        User user = new User();

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword()));
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setIsActive(true);

        Integer userId = userRepository.insert(user);

        // CUSTOMER role_id = 4
        userRepository.assignRole(userId, 4);
    }

    /**
     * Quên mật khẩu:
     * - Nếu email tồn tại: tạo mật khẩu tạm, cập nhật DB, gửi mail.
     * - Nếu không tồn tại: không báo lỗi (tránh lộ thông tin).
     */
    @Override
    @Transactional
    public void forgotPassword(String email) {
        if (email == null || email.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Email không được để trống");
        }

        String normalized = email.trim().toLowerCase();

        Optional<User> optionalUser = userRepository.findByEmail(normalized);

        // Thử tìm đúng email gốc nếu DB lưu hoa/thường khác
        if (optionalUser.isEmpty()) {
            optionalUser = userRepository.findByEmail(email.trim());
        }

        if (optionalUser.isEmpty()) {
            // Không tiết lộ email có tồn tại hay không
            return;
        }

        User user = optionalUser.get();

        if (!Boolean.TRUE.equals(user.getIsActive())) {
            // Tài khoản khóa: vẫn im lặng
            return;
        }

        String temporaryPassword = generateTemporaryPassword(10);

        userRepository.changePassword(
                user.getUserId(),
                passwordEncoder.encode(temporaryPassword));

        emailService.sendTemporaryPassword(
                user.getEmail(),
                user.getFullName(),
                user.getUsername(),
                temporaryPassword);
    }

    private String generateTemporaryPassword(int length) {
        StringBuilder sb = new StringBuilder(length);
        for (int i = 0; i < length; i++) {
            int index = secureRandom.nextInt(TEMP_PASSWORD_CHARS.length());
            sb.append(TEMP_PASSWORD_CHARS.charAt(index));
        }
        return sb.toString();
    }
}
