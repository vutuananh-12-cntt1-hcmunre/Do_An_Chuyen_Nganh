package com.example.restaurant_management.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PatchMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.restaurant_management.dto.User;
import com.example.restaurant_management.dto.UserRequest;
import com.example.restaurant_management.dto.UserResponse;
import com.example.restaurant_management.service.UserService;
@RestController
@RequestMapping("/api/users")
@CrossOrigin ("*")
public class UserController {
    private final UserService userService;
    public UserController(UserService userService){
        this.userService=userService;
    }
    @GetMapping
    public ResponseEntity<List<UserResponse>> getAllUsers(){
        return ResponseEntity.ok(userService.getAllUsers());
    }
    @GetMapping("/username/{username}")
    public ResponseEntity<UserResponse> getUserByUsername(@PathVariable String username){
        UserResponse user= userService.getUserByUsername(username);
        return ResponseEntity.ok(user);
    }
    @GetMapping("/{id}")
    public ResponseEntity<UserResponse> getUserById(@PathVariable Integer id){
        UserResponse user= userService.getUserById(id);
        return ResponseEntity.ok(user);
    }
    @PutMapping("/{id}")
    public ResponseEntity<String> updateUser(@PathVariable Integer id, @RequestBody User user){
        boolean result = userService.updateUser(id, user);
        if(result){
            return ResponseEntity.ok("cập nhật người dùng thành công");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("cập nhật người dùng thất bại");
    }
    @PatchMapping("/{id}/deactivate")
    public ResponseEntity<String> deactivateUser(@PathVariable Integer id){
        boolean result = userService.deactivateUser(id);
        if(result){
            return ResponseEntity.ok("khoá tài khoản thành công");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("khoá tài khoản thất bại");
    }
    @PatchMapping("/{id}/activate")
    public ResponseEntity<String> activateUser(@PathVariable Integer id){
        boolean result = userService.activateUser(id);
        if(result){
            return ResponseEntity.ok("mở tài khoản thành công");
        }
        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("mở khoá tài khoản thất bại");
    }
    @PostMapping
    public ResponseEntity<String> createUser(@RequestBody UserRequest request){
        User user = new User();
        user.setUsername(request.getUsername());
        user.setEmail(request.getEmail());
        user.setPasswordHash(request.getPassword());
        user.setFullName(request.getFullName());
        user.setPhone(request.getPhone());

        Integer userId = userService.createUser(user);
        return ResponseEntity.status(HttpStatus.CREATED).body("tạo tài khoản thành công. User ID là: "+userId);

    }
}
