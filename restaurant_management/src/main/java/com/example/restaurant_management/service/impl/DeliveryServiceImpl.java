package com.example.restaurant_management.service.impl;

import java.util.List;
import java.util.Set;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.restaurant_management.dto.Delivery;
import com.example.restaurant_management.dto.DeliveryResponse;
import com.example.restaurant_management.dto.Order;
import com.example.restaurant_management.repository.DeliveryRepository;
import com.example.restaurant_management.repository.OrderRepository;
import com.example.restaurant_management.service.DeliveryService;

@Service
public class DeliveryServiceImpl implements DeliveryService {

    private final DeliveryRepository deliveryRepository;
    private final OrderRepository orderRepository;

    private static final Set<String> VALID_STATUSES = Set.of(
            "PENDING",
            "ASSIGNED",
            "PICKED_UP",
            "DELIVERING",
            "DELIVERED",
            "FAILED",
            "CANCELLED"
    );

    private static final Set<String> TERMINAL_STATUSES = Set.of(
            "DELIVERED",
            "FAILED",
            "CANCELLED"
    );

    public DeliveryServiceImpl(
            DeliveryRepository deliveryRepository,
            OrderRepository orderRepository) {

        this.deliveryRepository = deliveryRepository;
        this.orderRepository = orderRepository;
    }

    // Lấy danh sách tất cả phiếu giao hàng
    @Override
    public List<DeliveryResponse> getAllDeliveries() {
        return deliveryRepository.findAll();
    }

    // Lấy chi tiết phiếu giao hàng
    @Override
    public DeliveryResponse getDeliveryById(Integer deliveryId) {

        return deliveryRepository.findById(deliveryId)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy thông tin giao hàng"
                ));
    }

    // Lấy danh sách giao hàng được phân công cho nhân viên
    @Override
    public List<DeliveryResponse> getDeliveriesByEmployee(String username) {

        Integer employeeId = getCurrentEmployeeId(username);

        return deliveryRepository.findByEmployeeId(employeeId);
    }

    // Lấy chi tiết giao hàng dành cho nhân viên được phân công
    @Override
    public DeliveryResponse getDeliveryByIdForEmployee(
            Integer deliveryId,
            String username) {

        Integer employeeId = getCurrentEmployeeId(username);

        DeliveryResponse delivery = getDeliveryById(deliveryId);

        checkDeliveryOwnership(delivery, employeeId);

        return delivery;
    }

    // Tạo phiếu giao hàng
    @Override
    @Transactional
    public DeliveryResponse createDelivery(Delivery delivery) {

        if (delivery.getOrderId() == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mã đơn hàng không được để trống"
            );
        }

        if (!deliveryRepository.existsDeliveryOrder(delivery.getOrderId())) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Đơn hàng không tồn tại hoặc không phải đơn giao hàng"
            );
        }

        if (deliveryRepository.existsByOrderId(delivery.getOrderId())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Đơn hàng đã có thông tin giao hàng"
            );
        }

        if (delivery.getDeliveryNote() != null
                && delivery.getDeliveryNote().length() > 500) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ghi chú giao hàng không được vượt quá 500 ký tự"
            );
        }

        delivery.setDeliveryStatus("PENDING");
        delivery.setEmployeeId(null);
        delivery.setAssignedAt(null);
        delivery.setPickedUpAt(null);
        delivery.setDeliveredAt(null);

        Integer deliveryId = deliveryRepository.insert(delivery);

        return getDeliveryById(deliveryId);
    }

    // Phân công nhân viên giao hàng
    @Override
    @Transactional
    public DeliveryResponse assignEmployee(
            Integer deliveryId,
            Integer employeeId) {

        DeliveryResponse current = getDeliveryById(deliveryId);

        if (employeeId == null) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Mã nhân viên không được để trống"
            );
        }

        if (!deliveryRepository.existsActiveEmployee(employeeId)) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Nhân viên không tồn tại hoặc không hoạt động"
            );
        }

        if (!"PENDING".equals(current.getDeliveryStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Chỉ được phân công giao hàng ở trạng thái PENDING"
            );
        }

        boolean updated = deliveryRepository.assignEmployee(
                deliveryId,
                employeeId
        );

        if (!updated) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Không thể phân công nhân viên giao hàng"
            );
        }

        return getDeliveryById(deliveryId);
    }

    // Cập nhật trạng thái bởi ADMIN/MANAGER
    @Override
    @Transactional
    public DeliveryResponse updateDeliveryStatus(
            Integer deliveryId,
            String deliveryStatus) {

        return processUpdateStatus(deliveryId, deliveryStatus);
    }

    // Cập nhật trạng thái bởi nhân viên được phân công
    @Override
    @Transactional
    public DeliveryResponse updateDeliveryStatusByEmployee(
            Integer deliveryId,
            String deliveryStatus,
            String username) {

        Integer employeeId = getCurrentEmployeeId(username);

        DeliveryResponse current = getDeliveryById(deliveryId);

        checkDeliveryOwnership(current, employeeId);

        return processUpdateStatus(deliveryId, deliveryStatus);
    }

    // Xử lý nghiệp vụ cập nhật trạng thái giao hàng
    @Transactional
    private DeliveryResponse processUpdateStatus(
            Integer deliveryId,
            String deliveryStatus) {

        DeliveryResponse current = getDeliveryById(deliveryId);

        if (deliveryStatus == null
                || !VALID_STATUSES.contains(deliveryStatus)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Trạng thái giao hàng không hợp lệ"
            );
        }

        String currentStatus = current.getDeliveryStatus();

        if (TERMINAL_STATUSES.contains(currentStatus)) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Giao hàng đã kết thúc, không thể cập nhật trạng thái"
            );
        }

        // Kiểm tra luồng chuyển trạng thái giao hàng
        boolean validTransition = switch (currentStatus) {

            case "PENDING" ->
                    "CANCELLED".equals(deliveryStatus);

            case "ASSIGNED" ->
                    Set.of(
                            "PICKED_UP",
                            "FAILED",
                            "CANCELLED"
                    ).contains(deliveryStatus);

            case "PICKED_UP" ->
                    Set.of(
                            "DELIVERING",
                            "FAILED"
                    ).contains(deliveryStatus);

            case "DELIVERING" ->
                    Set.of(
                            "DELIVERED",
                            "FAILED"
                    ).contains(deliveryStatus);

            default -> false;
        };

        if (!validTransition) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Không thể chuyển trạng thái từ "
                            + currentStatus
                            + " sang "
                            + deliveryStatus
            );
        }

        // Chỉ đồng bộ đơn hàng khi bắt đầu giao hoặc giao thành công
        if ("DELIVERING".equals(deliveryStatus)
                || "DELIVERED".equals(deliveryStatus)) {

            synchronizeOrderStatus(current, deliveryStatus);
        }

        boolean updated = deliveryRepository.updateStatus(
                deliveryId,
                deliveryStatus
        );

        if (!updated) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Không thể cập nhật trạng thái giao hàng"
            );
        }

        return getDeliveryById(deliveryId);
    }

    // Đồng bộ trạng thái đơn hàng với trạng thái giao hàng
    private void synchronizeOrderStatus(
            DeliveryResponse delivery,
            String deliveryStatus) {

        Order order = orderRepository.findById(
                delivery.getOrderId()
        );

        if (order == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy đơn hàng liên quan đến phiếu giao hàng"
            );
        }

        if (!"DELIVERY".equals(order.getOrderType())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Phiếu giao hàng không thuộc đơn hàng DELIVERY"
            );
        }

        String expectedOrderStatus;
        String newOrderStatus;

        if ("DELIVERING".equals(deliveryStatus)) {

            expectedOrderStatus = "READY";
            newOrderStatus = "DELIVERING";

        } else {

            expectedOrderStatus = "DELIVERING";
            newOrderStatus = "COMPLETED";
        }

        if (!expectedOrderStatus.equals(order.getOrderStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Không thể cập nhật đơn hàng từ trạng thái "
                            + order.getOrderStatus()
                            + " sang "
                            + newOrderStatus
            );
        }

        orderRepository.updateStatus(
                delivery.getOrderId(),
                newOrderStatus
        );
    }

    // Cập nhật ghi chú bởi ADMIN/MANAGER
    @Override
    @Transactional
    public DeliveryResponse updateDeliveryNote(
            Integer deliveryId,
            String deliveryNote) {

        return processUpdateNote(deliveryId, deliveryNote);
    }

    // Cập nhật ghi chú bởi nhân viên được phân công
    @Override
    @Transactional
    public DeliveryResponse updateDeliveryNoteByEmployee(
            Integer deliveryId,
            String deliveryNote,
            String username) {

        Integer employeeId = getCurrentEmployeeId(username);

        DeliveryResponse current = getDeliveryById(deliveryId);

        checkDeliveryOwnership(current, employeeId);

        return processUpdateNote(deliveryId, deliveryNote);
    }

    // Xử lý nghiệp vụ cập nhật ghi chú
    private DeliveryResponse processUpdateNote(
            Integer deliveryId,
            String deliveryNote) {

        getDeliveryById(deliveryId);

        if (deliveryNote != null && deliveryNote.length() > 500) {
            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Ghi chú không được vượt quá 500 ký tự"
            );
        }

        boolean updated = deliveryRepository.updateNote(
                deliveryId,
                deliveryNote
        );

        if (!updated) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy thông tin giao hàng"
            );
        }

        return getDeliveryById(deliveryId);
    }

    // Lấy employee_id từ username đăng nhập
    private Integer getCurrentEmployeeId(String username) {

        if (username == null || username.isBlank()) {
            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Không xác định được tài khoản đăng nhập"
            );
        }

        return deliveryRepository.findEmployeeIdByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.FORBIDDEN,
                        "Tài khoản không có hồ sơ nhân viên đang hoạt động"
                ));
    }

    // Kiểm tra nhân viên có được phân công phiếu giao hàng không
    private void checkDeliveryOwnership(
            DeliveryResponse delivery,
            Integer employeeId) {

        if (delivery.getEmployeeId() == null
                || !delivery.getEmployeeId().equals(employeeId)) {

            throw new ResponseStatusException(
                    HttpStatus.FORBIDDEN,
                    "Bạn không được phân công giao hàng này"
            );
        }
    }
}