package com.example.restaurant_management.service.impl;
import java.util.List;
import java.util.Optional;

import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import com.example.restaurant_management.dto.User;
import com.example.restaurant_management.dto.UserResponse;
import com.example.restaurant_management.repository.UserRepository;
import com.example.restaurant_management.service.UserService;

@Service
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserServiceImpl(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder) {

        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // Chuyển User thành UserResponse
    private UserResponse convertToResponse(User user) {

        UserResponse response = new UserResponse();

        response.setUserId(user.getUserId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFullName(user.getFullName());
        response.setPhone(user.getPhone());
        response.setIsActive(user.getIsActive());

        return response;
    }

    // Lấy danh sách người dùng
    @Override
    public List<UserResponse> getAllUsers() {

        return userRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .toList();
    }

    // Lấy người dùng theo ID
    @Override
    public UserResponse getUserById(Integer userId) {

        User user = userRepository.findById(userId)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy người dùng có ID: " + userId));

        return convertToResponse(user);
    }

    // Lấy người dùng theo username
    @Override
    public UserResponse getUserByUsername(String username) {

        User user = userRepository.findByUsername(username)
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy tài khoản: " + username));

        return convertToResponse(user);
    }

    // Thêm người dùng
    @Override
    public Integer createUser(User user) {

        if (userRepository.existsByUsername(user.getUsername())) {
            throw new RuntimeException("Username đã tồn tại!");
        }

        if (userRepository.existsByEmail(user.getEmail())) {
            throw new RuntimeException("Email đã tồn tại!");
        }

        // Mã hóa mật khẩu trước khi lưu
        user.setPasswordHash(
                passwordEncoder.encode(user.getPasswordHash())
        );

        user.setIsActive(true);

        return userRepository.insert(user);
    }

    // Cập nhật thông tin người dùng
    @Override
    public boolean updateUser(Integer userId, User user) {

        Optional<User> existingUser = userRepository.findById(userId);

        if (existingUser.isEmpty()) {
            throw new RuntimeException("Không tìm thấy người dùng!");
        }

        Optional<User> userByUsername =
                userRepository.findByUsername(user.getUsername());

        if (userByUsername.isPresent()
                && !userByUsername.get().getUserId().equals(userId)) {
            throw new RuntimeException("Username đã được sử dụng!");
        }

        Optional<User> userByEmail =
                userRepository.findByEmail(user.getEmail());

        if (userByEmail.isPresent()
                && !userByEmail.get().getUserId().equals(userId)) {
            throw new RuntimeException("Email đã được sử dụng!");
        }

        user.setUserId(userId);

        return userRepository.edit(user) > 0;
    }

    // Khóa tài khoản
    @Override
    public boolean deactivateUser(Integer userId) {

        if (userRepository.findById(userId).isEmpty()) {
            throw new RuntimeException("Không tìm thấy người dùng!");
        }

        return userRepository.deactivate(userId) > 0;
    }

    // Mở khóa tài khoản
    @Override
    public boolean activateUser(Integer userId) {

        if (userRepository.findById(userId).isEmpty()) {
            throw new RuntimeException("Không tìm thấy người dùng!");
        }

        return userRepository.activate(userId) > 0;
    }
}
