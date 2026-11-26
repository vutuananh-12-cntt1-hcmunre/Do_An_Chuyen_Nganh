package com.example.restaurant_management.controller;

import java.io.IOException;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.restaurant_management.service.ImageStorageService;

@RestController
@RequestMapping("/api/uploads")
public class ImageController {

    private final ImageStorageService imageStorageService;

    public ImageController(ImageStorageService imageStorageService) {
        this.imageStorageService = imageStorageService;
    }

    @PostMapping("/dishes")
    public ResponseEntity<?> uploadDishImage(
            @RequestParam("file") MultipartFile file) {

        try {
            String fileName = imageStorageService.uploadDishImage(file);

            return ResponseEntity.ok(Map.of(
                "fileName", fileName,
                "imageUrl", "/uploads/dishes/" + fileName
            ));

        } catch (IllegalArgumentException e) {
            return ResponseEntity.badRequest().body(
                Map.of("message", e.getMessage())
            );

        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(
                Map.of("message", "Không thể lưu ảnh")
            );
        }
    }
}