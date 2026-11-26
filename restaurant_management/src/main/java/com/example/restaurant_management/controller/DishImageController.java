
package com.example.restaurant_management.controller;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.Map;
import java.util.Set;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.web.server.ResponseStatusException;

@RestController
@RequestMapping("/api/dishes")
public class DishImageController {

    private static final Path UPLOAD_DIR =
            Paths.get("uploads", "dishes")
                    .toAbsolutePath()
                    .normalize();

    private static final long MAX_FILE_SIZE = 5 * 1024 * 1024;

    private static final Set<String> ALLOWED_TYPES = Set.of(
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif"
    );

    @PostMapping(
            value = "/upload",
            consumes = MediaType.MULTIPART_FORM_DATA_VALUE
    )
    public Map<String, String> uploadImage(
            @RequestParam("file") MultipartFile file) {

        if (file == null || file.isEmpty()) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Vui lòng chọn ảnh."
            );
        }

        if (file.getSize() > MAX_FILE_SIZE) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ảnh không được vượt quá 5MB."
            );
        }

        String contentType = file.getContentType();

        if (contentType == null || !ALLOWED_TYPES.contains(contentType)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Chỉ chấp nhận ảnh JPG, PNG, WEBP hoặc GIF."
            );
        }

        String extension;

        switch (contentType) {
            case "image/jpeg":
                extension = ".jpg";
                break;
            case "image/png":
                extension = ".png";
                break;
            case "image/webp":
                extension = ".webp";
                break;
            case "image/gif":
                extension = ".gif";
                break;
            default:
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Định dạng ảnh không hợp lệ."
                );
        }

        String fileName = UUID.randomUUID() + extension;

        try {
            Files.createDirectories(UPLOAD_DIR);

            Path destination = UPLOAD_DIR.resolve(fileName).normalize();

            if (!destination.startsWith(UPLOAD_DIR)) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Tên file không hợp lệ."
                );
            }

            file.transferTo(destination);

            return Map.of(
                    "fileName", fileName,
                    "imageUrl", "/uploads/dishes/" + fileName
            );

        } catch (IOException e) {
            throw new ResponseStatusException(
                    HttpStatus.INTERNAL_SERVER_ERROR,
                    "Không thể lưu ảnh lên máy chủ."
            );
        }
    }
}
