
package com.example.restaurant_management.service.impl;

import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.web.server.ResponseStatusException;

import com.example.restaurant_management.dto.Table;
import com.example.restaurant_management.dto.TableRequest;
import com.example.restaurant_management.dto.TableResponse;
import com.example.restaurant_management.repository.TableRepository;
import com.example.restaurant_management.service.TableService;

@Service
public class TableServiceImpl implements TableService {

    private final TableRepository tableRepository;

    public TableServiceImpl(TableRepository tableRepository) {
        this.tableRepository = tableRepository;
    }

    // 1. Chuyển Table thành TableResponse
    private TableResponse convertToResponse(Table table) {

        return new TableResponse(
                table.getTableId(),
                table.getTableCode(),
                table.getCapacity(),
                table.getTableStatus(),
                table.getDescription(),
                table.getIsActive(),
                table.getCreatedAt()
        );
    }

    // 2. Chuyển TableRequest thành Table
    private Table convertToTable(TableRequest request) {

        Table table = new Table();

        table.setTableCode(request.getTableCode());
        table.setCapacity(request.getCapacity());
        table.setTableStatus(request.getTableStatus());
        table.setDescription(request.getDescription());

        return table;
    }

    // 3. Lấy danh sách bàn ăn
    @Override
    public List<TableResponse> getAllTables() {

        return tableRepository.findAll()
                .stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    // 4. Lấy thông tin bàn theo ID
    @Override
    public TableResponse getTableById(Integer tableId) {

        Table table = tableRepository.findById(tableId);

        if (table == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy bàn ăn"
            );
        }

        return convertToResponse(table);
    }

    // 5. Thêm bàn mới
    @Override
    public Integer createTable(TableRequest request) {

        if (tableRepository.existsByTableCode(request.getTableCode())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Mã bàn đã tồn tại"
            );
        }

        Table table = convertToTable(request);

        return tableRepository.insert(table);
    }

    // 6. Cập nhật thông tin bàn
    @Override
    public boolean updateTable(Integer tableId, TableRequest request) {

        Table existingTable = tableRepository.findById(tableId);

        if (existingTable == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy bàn ăn"
            );
        }

        if (tableRepository.existsByTableCodeExceptId(
                request.getTableCode(),
                tableId
        )) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Mã bàn đã được sử dụng bởi bàn khác"
            );
        }

        Table table = convertToTable(request);

        return tableRepository.update(tableId, table);
    }

    // 7. Vô hiệu hóa bàn
    @Override
    public boolean deactivateTable(Integer tableId) {

        Table table = tableRepository.findById(tableId);

        if (table == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy bàn ăn"
            );
        }

        if (Boolean.FALSE.equals(table.getIsActive())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Bàn ăn đã được vô hiệu hóa trước đó"
            );
        }

        return tableRepository.deactivate(tableId);
    }

    // 8. Kích hoạt bàn
    @Override
    public boolean activateTable(Integer tableId) {

        Table table = tableRepository.findById(tableId);

        if (table == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy bàn ăn"
            );
        }

        if (Boolean.TRUE.equals(table.getIsActive())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Bàn ăn đang hoạt động"
            );
        }

        return tableRepository.activate(tableId);
    }
}
