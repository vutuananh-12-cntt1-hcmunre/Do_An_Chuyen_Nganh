
package com.example.restaurant_management.service;

import java.util.List;

import com.example.restaurant_management.dto.TableRequest;
import com.example.restaurant_management.dto.TableResponse;

public interface TableService {

    // Lấy danh sách bàn ăn
    List<TableResponse> getAllTables();

    // Lấy thông tin bàn theo ID
    TableResponse getTableById(Integer tableId);

    // Thêm bàn mới
    Integer createTable(TableRequest request);

    // Cập nhật thông tin bàn
    boolean updateTable(Integer tableId, TableRequest request);

    // Vô hiệu hóa bàn
    boolean deactivateTable(Integer tableId);

    // Kích hoạt bàn
    boolean activateTable(Integer tableId);
}
