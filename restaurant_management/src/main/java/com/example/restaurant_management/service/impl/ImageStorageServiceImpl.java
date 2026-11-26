package com.example.restaurant_management.service.impl;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Set;
import java.util.UUID;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.restaurant_management.service.ImageStorageService;

@Service
public class ImageStorageServiceImpl implements ImageStorageService {

    private static final Set<String> ALLOWED_TYPES = Set.of(
        "image/jpeg",
        "image/png",
        "image/webp"
    );

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    @Value("${app.upload.dir:uploads}")
    private String uploadDirectory;

    @Override
    public String uploadDishImage(MultipartFile file) throws IOException {

        if (file == null || file.isEmpty()) {
            throw new IllegalArgumentException("Vui lòng chọn ảnh");
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new IllegalArgumentException("Ảnh không được vượt quá 5MB");
        }

        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new IllegalArgumentException(
                "Chỉ chấp nhận ảnh JPG, PNG hoặc WEBP"
            );
        }

        String extension = switch (contentType) {
            case "image/jpeg" -> ".jpg";
            case "image/png" -> ".png";
            case "image/webp" -> ".webp";
            default -> throw new IllegalArgumentException(
                "Định dạng ảnh không hợp lệ"
            );
        };

        Path directory = Paths.get(uploadDirectory, "dishes")
            .toAbsolutePath()
            .normalize();

        Files.createDirectories(directory);

        String fileName = UUID.randomUUID() + extension;

        Path destination = directory.resolve(fileName).normalize();

        if (!destination.startsWith(directory)) {
            throw new IllegalArgumentException("Đường dẫn file không hợp lệ");
        }

        Files.copy(file.getInputStream(), destination);

        return fileName;
    }
}