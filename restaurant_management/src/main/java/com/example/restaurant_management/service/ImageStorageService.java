package com.example.restaurant_management.service;

import java.io.IOException;

import org.springframework.web.multipart.MultipartFile;

public interface ImageStorageService {

    String uploadDishImage(MultipartFile file) throws IOException;
}