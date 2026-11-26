
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

import com.example.restaurant_management.dto.TableRequest;
import com.example.restaurant_management.dto.TableResponse;
import com.example.restaurant_management.service.TableService;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/tables")
@CrossOrigin("*")
public class TableController {

    private final TableService tableService;

    public TableController(TableService tableService) {
        this.tableService = tableService;
    }

    // 1. Lấy danh sách bàn ăn
    @GetMapping
    public ResponseEntity<List<TableResponse>> getAllTables() {

        return ResponseEntity.ok(
                tableService.getAllTables()
        );
    }

    // 2. Lấy thông tin bàn theo ID
    @GetMapping("/{tableId}")
    public ResponseEntity<TableResponse> getTableById(
            @PathVariable Integer tableId
    ) {

        return ResponseEntity.ok(
                tableService.getTableById(tableId)
        );
    }

    // 3. Thêm bàn mới
    @PostMapping
    public ResponseEntity<Integer> createTable(
            @Valid @RequestBody TableRequest request
    ) {

        Integer tableId = tableService.createTable(request);

        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(tableId);
    }

    // 4. Cập nhật thông tin bàn
    @PutMapping("/{tableId}")
    public ResponseEntity<String> updateTable(
            @PathVariable Integer tableId,
            @Valid @RequestBody TableRequest request
    ) {

        tableService.updateTable(tableId, request);

        return ResponseEntity.ok(
                "Cập nhật bàn ăn thành công"
        );
    }

    // 5. Vô hiệu hóa bàn
    @PatchMapping("/{tableId}/deactivate")
    public ResponseEntity<String> deactivateTable(
            @PathVariable Integer tableId
    ) {

        tableService.deactivateTable(tableId);

        return ResponseEntity.ok(
                "Vô hiệu hóa bàn ăn thành công"
        );
    }

    // 6. Kích hoạt bàn
    @PatchMapping("/{tableId}/activate")
    public ResponseEntity<String> activateTable(
            @PathVariable Integer tableId
    ) {

        tableService.activateTable(tableId);

        return ResponseEntity.ok(
                "Kích hoạt bàn ăn thành công"
        );
    }
}
