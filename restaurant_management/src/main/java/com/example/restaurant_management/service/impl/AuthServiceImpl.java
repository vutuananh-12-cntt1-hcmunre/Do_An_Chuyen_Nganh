
package com.example.restaurant_management.service.impl;

import java.util.List;

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

@Service
public class AuthServiceImpl implements AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public AuthServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
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

        // Kiểm tra username đã tồn tại
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Username đã tồn tại");
        }

        // Kiểm tra email đã tồn tại
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Email đã được sử dụng");
        }

        // Tạo tài khoản mới
        User user = new User();

        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());

        // Mã hóa mật khẩu bằng BCrypt
        user.setPasswordHash(
                passwordEncoder.encode(request.getPassword()));

        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());
        user.setIsActive(true);

        // Lưu tài khoản và lấy ID
        Integer userId = userRepository.insert(user);

        // Tự động gán quyền CUSTOMER (role_id = 4)
        userRepository.assignRole(userId, 4);
    }
}
