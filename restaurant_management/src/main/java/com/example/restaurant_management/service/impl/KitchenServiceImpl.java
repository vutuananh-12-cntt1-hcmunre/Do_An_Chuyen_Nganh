
package com.example.restaurant_management.service.impl;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.restaurant_management.dto.KitchenOrderItemResponse;
import com.example.restaurant_management.dto.OrderResponse;
import com.example.restaurant_management.repository.KitchenRepository;
import com.example.restaurant_management.service.KitchenService;
import com.example.restaurant_management.service.OrderService;

@Service
public class KitchenServiceImpl implements KitchenService {

    private final KitchenRepository kitchenRepository;
    private final OrderService orderService;

    public KitchenServiceImpl(
            KitchenRepository kitchenRepository,
            OrderService orderService
    ) {
        this.kitchenRepository = kitchenRepository;
        this.orderService = orderService;
    }

    // Lấy danh sách món đang chờ và đang chế biến
    @Override
    public List<KitchenOrderItemResponse> getKitchenItems() {
        return kitchenRepository.findPendingKitchenItems();
    }

    // Bắt đầu chế biến món
    @Override
    @Transactional
    public void startPreparing(Integer orderItemId) {

        // Kiểm tra món có tồn tại không
        String itemStatus =
                kitchenRepository.findItemStatusById(orderItemId);

        if (itemStatus == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy món ăn trong đơn hàng"
            );
        }

        if (!"PENDING".equals(itemStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Chỉ có thể bắt đầu chế biến món đang PENDING"
            );
        }

        // Lấy mã đơn hàng chứa món ăn
        Integer orderId =
                kitchenRepository.findOrderIdByItemId(orderItemId);

        if (orderId == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy đơn hàng của món ăn"
            );
        }

        // Kiểm tra trạng thái đơn hàng
        OrderResponse order = orderService.getOrderById(orderId);

        if (!"CONFIRMED".equals(order.getOrderStatus())
                && !"PREPARING".equals(order.getOrderStatus())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Đơn hàng chưa được xác nhận hoặc không thể chế biến"
            );
        }

        // Cập nhật món PENDING -> PREPARING
        int updated = kitchenRepository.updateItemStatus(
                orderItemId,
                "PENDING",
                "PREPARING"
        );

        if (updated == 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Món ăn đã được cập nhật bởi thao tác khác"
            );
        }

        // Nếu đơn đang CONFIRMED thì chuyển sang PREPARING
        // Các món tiếp theo không cần chuyển lại trạng thái đơn
        if ("CONFIRMED".equals(order.getOrderStatus())) {
            orderService.startPreparing(orderId);
        }
    }

    // Hoàn thành một món ăn
    @Override
    @Transactional
    public void completeItem(Integer orderItemId) {

        // Kiểm tra món có tồn tại không
        String itemStatus =
                kitchenRepository.findItemStatusById(orderItemId);

        if (itemStatus == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy món ăn trong đơn hàng"
            );
        }

        if (!"PREPARING".equals(itemStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Chỉ có thể hoàn thành món đang PREPARING"
            );
        }

        // Lấy mã đơn hàng chứa món ăn
        Integer orderId =
                kitchenRepository.findOrderIdByItemId(orderItemId);

        if (orderId == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy đơn hàng của món ăn"
            );
        }

        // Cập nhật món PREPARING -> COMPLETED
        int updated = kitchenRepository.updateItemStatus(
                orderItemId,
                "PREPARING",
                "COMPLETED"
        );

        if (updated == 0) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Món ăn đã được cập nhật bởi thao tác khác"
            );
        }

        // Kiểm tra đơn hàng còn món chưa hoàn thành không
        boolean hasUncompletedItems =
                kitchenRepository.existsUncompletedItemsByOrderId(orderId);

        if (!hasUncompletedItems) {

            // Chỉ chuyển đơn PREPARING -> READY
            // markReady() đồng thời tạo phiếu giao hàng nếu là DELIVERY
            OrderResponse order = orderService.getOrderById(orderId);

            if ("PREPARING".equals(order.getOrderStatus())) {
                orderService.markReady(orderId);
            }
        }
    }

    // Lấy danh sách món đã hoàn thành
    @Override
    public List<KitchenOrderItemResponse> getCompletedKitchenItems() {
        return kitchenRepository.findCompletedKitchenItems();
    }
}
