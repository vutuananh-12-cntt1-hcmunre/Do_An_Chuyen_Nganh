
package com.example.restaurant_management.service;

import java.util.List;

import com.example.restaurant_management.dto.Delivery;
import com.example.restaurant_management.dto.DeliveryResponse;

public interface DeliveryService {

    List<DeliveryResponse> getAllDeliveries();

    DeliveryResponse getDeliveryById(Integer deliveryId);

    // Lấy danh sách giao hàng được phân công cho nhân viên
    List<DeliveryResponse> getDeliveriesByEmployee(String username);

    // Lấy chi tiết giao hàng dành cho nhân viên được phân công
    DeliveryResponse getDeliveryByIdForEmployee(
            Integer deliveryId,
            String username
    );

    DeliveryResponse createDelivery(Delivery delivery);

    DeliveryResponse assignEmployee(
            Integer deliveryId,
            Integer employeeId
    );

    DeliveryResponse updateDeliveryStatus(
            Integer deliveryId,
            String deliveryStatus
    );

    DeliveryResponse updateDeliveryStatusByEmployee(
            Integer deliveryId,
            String deliveryStatus,
            String username
    );

    DeliveryResponse updateDeliveryNote(
            Integer deliveryId,
            String deliveryNote
    );

    DeliveryResponse updateDeliveryNoteByEmployee(
            Integer deliveryId,
            String deliveryNote,
            String username
    );
}
