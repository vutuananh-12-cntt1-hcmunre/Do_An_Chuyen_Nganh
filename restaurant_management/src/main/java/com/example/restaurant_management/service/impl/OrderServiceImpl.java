package com.example.restaurant_management.service.impl;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.restaurant_management.dto.Delivery;
import com.example.restaurant_management.dto.Dish;
import com.example.restaurant_management.dto.Order;
import com.example.restaurant_management.dto.OrderItem;
import com.example.restaurant_management.dto.OrderRequest;
import com.example.restaurant_management.dto.OrderResponse;
import com.example.restaurant_management.dto.Promotion;
import com.example.restaurant_management.dto.Table;
import com.example.restaurant_management.dto.User;
import com.example.restaurant_management.repository.DeliveryRepository;
import com.example.restaurant_management.repository.DishRepository;
import com.example.restaurant_management.repository.OrderRepository;
import com.example.restaurant_management.repository.PromotionRepository;
import com.example.restaurant_management.repository.TableRepository;
import com.example.restaurant_management.repository.UserRepository;
import com.example.restaurant_management.service.OrderService;

@Service
public class OrderServiceImpl implements OrderService {

    private final OrderRepository orderRepository;
    private final DishRepository dishRepository;
    private final TableRepository tableRepository;
    private final UserRepository userRepository;
    private final PromotionRepository promotionRepository;
    private final DeliveryRepository deliveryRepository;

    public OrderServiceImpl(
            OrderRepository orderRepository,
            DishRepository dishRepository,
            TableRepository tableRepository,
            UserRepository userRepository,
            PromotionRepository promotionRepository,
            DeliveryRepository deliveryRepository) {

        this.orderRepository = orderRepository;
        this.dishRepository = dishRepository;
        this.tableRepository = tableRepository;
        this.userRepository = userRepository;
        this.promotionRepository = promotionRepository;
        this.deliveryRepository = deliveryRepository;
    }

    // Lấy tài khoản đang đăng nhập
    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || authentication.getPrincipal() == null
                || "anonymousUser".equals(authentication.getPrincipal())) {

            throw new ResponseStatusException(
                    HttpStatus.UNAUTHORIZED,
                    "Bạn chưa đăng nhập"
            );
        }

        String username = authentication.getName();

        return userRepository.findByUsername(username)
                .orElseThrow(() -> new ResponseStatusException(
                        HttpStatus.UNAUTHORIZED,
                        "Không tìm thấy tài khoản"
                ));
    }

    // Lấy tất cả đơn hàng
    @Override
    public List<OrderResponse> getAllOrders() {

        List<Order> orders = orderRepository.findAll();
        List<OrderResponse> responses = new ArrayList<>();

        for (Order order : orders) {
            responses.add(convertToResponse(order));
        }

        return responses;
    }

    // Lấy chi tiết đơn hàng
    @Override
    public OrderResponse getOrderById(Integer orderId) {

        Order order = getExistingOrder(orderId);

        return convertToResponse(order);
    }

    // Lấy đơn hàng của khách hàng đang đăng nhập
    @Override
    public List<OrderResponse> getMyOrders() {

        User user = getCurrentUser();

        List<Order> orders =
                orderRepository.findByUserId(user.getUserId());

        List<OrderResponse> responses = new ArrayList<>();

        for (Order order : orders) {
            responses.add(convertToResponse(order));
        }

        return responses;
    }

    // Tạo đơn hàng
    @Override
    @Transactional
    public OrderResponse createOrder(OrderRequest request) {

        User user = getCurrentUser();

        String orderType = request.getOrderType();

        if (!"DELIVERY".equals(orderType)
                && !"DINE_IN".equals(orderType)) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Loại đơn hàng không hợp lệ"
            );
        }

        // Kiểm tra bàn đối với đơn tại nhà hàng
        if ("DINE_IN".equals(orderType)) {

            if (request.getTableId() != null) {

                Table table = tableRepository.findById(
                        request.getTableId()
                );

                if (table == null) {
                    throw new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Không tìm thấy bàn"
                    );
                }

                if (!Boolean.TRUE.equals(table.getIsActive())) {
                    throw new ResponseStatusException(
                            HttpStatus.BAD_REQUEST,
                            "Bàn hiện không hoạt động"
                    );
                }

                if (!"AVAILABLE".equals(table.getTableStatus())) {
                    throw new ResponseStatusException(
                            HttpStatus.CONFLICT,
                            "Bàn hiện không khả dụng"
                    );
                }
            }

        } else {

            if (request.getDeliveryAddress() == null
                    || request.getDeliveryAddress().isBlank()) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Địa chỉ giao hàng không được để trống"
                );
            }
        }

        // Kiểm tra danh sách món ăn
        if (request.getItems() == null
                || request.getItems().isEmpty()) {

            throw new ResponseStatusException(
                    HttpStatus.BAD_REQUEST,
                    "Đơn hàng phải có ít nhất một món ăn"
            );
        }

        // Tính tiền món ăn theo giá trong database
        BigDecimal subtotal = BigDecimal.ZERO;
        List<OrderItem> orderItems = new ArrayList<>();

        for (OrderRequest.OrderItemRequest itemRequest
                : request.getItems()) {

            if (itemRequest.getDishId() == null
                    || itemRequest.getQuantity() == null
                    || itemRequest.getQuantity() <= 0) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Thông tin món ăn hoặc số lượng không hợp lệ"
                );
            }

            Dish dish = dishRepository.findById(
                    itemRequest.getDishId()
            );

            if (dish == null) {
                throw new ResponseStatusException(
                        HttpStatus.NOT_FOUND,
                        "Không tìm thấy món ăn có ID: "
                                + itemRequest.getDishId()
                );
            }

            if (!Boolean.TRUE.equals(dish.getIsAvailable())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Món ăn hiện không được bán: "
                                + dish.getDishName()
                );
            }

            BigDecimal unitPrice = dish.getCurrentPrice();

            BigDecimal itemSubtotal = unitPrice.multiply(
                    BigDecimal.valueOf(itemRequest.getQuantity())
            );

            subtotal = subtotal.add(itemSubtotal);

            OrderItem orderItem = new OrderItem();
            orderItem.setDishId(itemRequest.getDishId());
            orderItem.setQuantity(itemRequest.getQuantity());
            orderItem.setUnitPrice(unitPrice);
            orderItem.setSubtotal(itemSubtotal);
            orderItem.setItemNote(itemRequest.getItemNote());
            orderItem.setItemStatus("PENDING");

            orderItems.add(orderItem);
        }

        subtotal = subtotal.setScale(2, RoundingMode.HALF_UP);

        // Kiểm tra và tính khuyến mãi
        Promotion appliedPromotion = null;
        BigDecimal discountAmount = BigDecimal.ZERO;

        String promotionCode = request.getPromotionCode();

        if (promotionCode != null && !promotionCode.isBlank()) {

            promotionCode = promotionCode.trim().toUpperCase();

            appliedPromotion = promotionRepository
                    .findByCodeForUpdate(promotionCode)
                    .orElseThrow(() -> new ResponseStatusException(
                            HttpStatus.NOT_FOUND,
                            "Mã khuyến mãi không tồn tại"
                    ));

            LocalDateTime now = LocalDateTime.now();

            if (!Boolean.TRUE.equals(appliedPromotion.getIsActive())) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Mã khuyến mãi hiện không hoạt động"
                );
            }

            if (now.isBefore(appliedPromotion.getStartAt())
                    || now.isAfter(appliedPromotion.getEndAt())) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Mã khuyến mãi đã hết hạn hoặc chưa đến thời gian áp dụng"
                );
            }

            Integer usageLimit = appliedPromotion.getUsageLimit();

            int usedCount = appliedPromotion.getUsedCount() == null
                    ? 0
                    : appliedPromotion.getUsedCount();

            if (usageLimit != null && usedCount >= usageLimit) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Mã khuyến mãi đã hết lượt sử dụng"
                );
            }

            BigDecimal minOrderAmount =
                    appliedPromotion.getMinOrderAmount() == null
                            ? BigDecimal.ZERO
                            : appliedPromotion.getMinOrderAmount();

            if (subtotal.compareTo(minOrderAmount) < 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Đơn hàng chưa đạt giá trị tối thiểu để áp dụng mã"
                );
            }

            BigDecimal discountValue =
                    appliedPromotion.getDiscountValue();

            if (discountValue == null
                    || discountValue.compareTo(BigDecimal.ZERO) <= 0) {

                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Giá trị khuyến mãi không hợp lệ"
                );
            }

            if ("PERCENTAGE".equals(
                    appliedPromotion.getDiscountType())) {

                discountAmount = subtotal
                        .multiply(discountValue)
                        .divide(
                                new BigDecimal("100"),
                                2,
                                RoundingMode.HALF_UP
                        );

            } else if ("FIXED_AMOUNT".equals(
                    appliedPromotion.getDiscountType())) {

                discountAmount = discountValue;

            } else {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Loại khuyến mãi không hợp lệ"
                );
            }

            // Áp dụng mức giảm tối đa
            BigDecimal maxDiscountAmount =
                    appliedPromotion.getMaxDiscountAmount();

            if (maxDiscountAmount != null
                    && discountAmount.compareTo(maxDiscountAmount) > 0) {

                discountAmount = maxDiscountAmount;
            }

            // Không giảm vượt quá tiền món ăn
            if (discountAmount.compareTo(subtotal) > 0) {
                discountAmount = subtotal;
            }

            discountAmount = discountAmount.setScale(
                    2,
                    RoundingMode.HALF_UP
            );

            if (discountAmount.compareTo(BigDecimal.ZERO) <= 0) {
                throw new ResponseStatusException(
                        HttpStatus.BAD_REQUEST,
                        "Mã khuyến mãi không tạo ra giá trị giảm hợp lệ"
                );
            }
        }

        // Phí giao hàng hiện tại bằng 0
        BigDecimal deliveryFee = BigDecimal.ZERO;

        BigDecimal totalAmount = subtotal
                .subtract(discountAmount)
                .add(deliveryFee)
                .setScale(2, RoundingMode.HALF_UP);

        // Khởi tạo đơn hàng
        Order order = new Order();

        String orderCode = "ORD"
                + UUID.randomUUID()
                        .toString()
                        .replace("-", "")
                        .substring(0, 8)
                        .toUpperCase();

        order.setOrderCode(orderCode);
        order.setUserId(user.getUserId());

        order.setTableId(
                "DINE_IN".equals(orderType)
                        ? request.getTableId()
                        : null
        );

        order.setOrderType(orderType);
        order.setOrderStatus("PENDING");
        order.setDeliveryAddress(request.getDeliveryAddress());
        order.setCustomerNote(request.getCustomerNote());

        order.setSubtotal(subtotal);
        order.setDiscountAmount(discountAmount);
        order.setDeliveryFee(deliveryFee);
        order.setTotalAmount(totalAmount);

        Integer orderId = orderRepository.insert(order);

        // Lưu chi tiết món ăn
        for (OrderItem item : orderItems) {
            item.setOrderId(orderId);
            orderRepository.insertItem(item);
        }

        // Lưu mã khuyến mãi và tăng lượt sử dụng
        if (appliedPromotion != null) {

            orderRepository.insertOrderPromotion(
                    orderId,
                    appliedPromotion.getPromotionId(),
                    discountAmount
            );

            int updated = promotionRepository.incrementUsedCount(
                    appliedPromotion.getPromotionId()
            );

            if (updated == 0) {
                throw new ResponseStatusException(
                        HttpStatus.CONFLICT,
                        "Mã khuyến mãi vừa hết lượt sử dụng"
                );
            }
        }

        return getOrderById(orderId);
    }

    // Xác nhận đơn hàng
    @Override
    public void confirmOrder(Integer orderId) {
        updateOrderStatus(orderId, "PENDING", "CONFIRMED");
    }

    // Hủy đơn hàng
    @Override
    public void cancelOrder(Integer orderId) {

        Order order = getExistingOrder(orderId);

        if (!"PENDING".equals(order.getOrderStatus())
                && !"CONFIRMED".equals(order.getOrderStatus())) {

            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Chỉ có thể hủy đơn đang chờ xác nhận hoặc đã xác nhận"
            );
        }

        orderRepository.updateStatus(orderId, "CANCELLED");
    }

    // Bếp bắt đầu chế biến
    @Override
    public void startPreparing(Integer orderId) {
        updateOrderStatus(orderId, "CONFIRMED", "PREPARING");
    }

    // Bếp hoàn thành chế biến
    // Nếu là DELIVERY thì tự động tạo phiếu giao hàng
    @Override
    @Transactional
    public void markReady(Integer orderId) {

        Order order = getExistingOrder(orderId);

        if (!"PREPARING".equals(order.getOrderStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Chỉ có thể chuyển sang READY khi đơn đang PREPARING"
            );
        }

        // Cập nhật trạng thái đơn hàng
        orderRepository.updateStatus(orderId, "READY");

        // Tự động tạo phiếu giao hàng đối với đơn DELIVERY
        if ("DELIVERY".equals(order.getOrderType())) {

            // Tránh tạo trùng phiếu giao hàng
            if (!deliveryRepository.existsByOrderId(orderId)) {

                Delivery delivery = new Delivery();

                delivery.setOrderId(orderId);
                delivery.setEmployeeId(null);
                delivery.setDeliveryStatus("PENDING");
                delivery.setAssignedAt(null);
                delivery.setPickedUpAt(null);
                delivery.setDeliveredAt(null);

                deliveryRepository.insert(delivery);
            }
        }
    }

    // Hoàn tất đơn hàng tại nhà hàng
    // Đơn DELIVERY phải hoàn tất qua quy trình giao hàng
    @Override
    public void completeOrder(Integer orderId) {

        Order order = getExistingOrder(orderId);

        if ("DELIVERY".equals(order.getOrderType())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Đơn giao tận nơi phải được hoàn tất qua chức năng giao hàng"
            );
        }

        updateOrderStatus(orderId, "READY", "COMPLETED");
    }

    // Lấy đơn hàng hiện có
    private Order getExistingOrder(Integer orderId) {

        Order order = orderRepository.findById(orderId);

        if (order == null) {
            throw new ResponseStatusException(
                    HttpStatus.NOT_FOUND,
                    "Không tìm thấy đơn hàng"
            );
        }

        return order;
    }

    // Cập nhật trạng thái đơn hàng có kiểm tra trạng thái hiện tại
    private void updateOrderStatus(
            Integer orderId,
            String currentStatus,
            String newStatus) {

        Order order = getExistingOrder(orderId);

        if (!currentStatus.equals(order.getOrderStatus())) {
            throw new ResponseStatusException(
                    HttpStatus.CONFLICT,
                    "Không thể chuyển trạng thái đơn hàng từ "
                            + order.getOrderStatus()
                            + " sang "
                            + newStatus
            );
        }

        orderRepository.updateStatus(orderId, newStatus);
    }

    // Chuyển dữ liệu Order thành OrderResponse
    private OrderResponse convertToResponse(Order order) {

        User user = userRepository.findById(order.getUserId())
                .orElse(null);

        String username = user != null
                ? user.getUsername()
                : null;

        String tableCode = null;

        if (order.getTableId() != null) {

            Table table = tableRepository.findById(
                    order.getTableId()
            );

            if (table != null) {
                tableCode = table.getTableCode();
            }
        }

        List<OrderItem> orderItems =
                orderRepository.findItemsByOrderId(order.getOrderId());

        List<OrderResponse.OrderItemResponse> itemResponses =
                new ArrayList<>();

        for (OrderItem item : orderItems) {

            OrderResponse.OrderItemResponse itemResponse =
                    new OrderResponse.OrderItemResponse(
                            item.getOrderItemId(),
                            item.getDishId(),
                            item.getDishName(),
                            item.getQuantity(),
                            item.getUnitPrice(),
                            item.getSubtotal(),
                            item.getItemNote(),
                            item.getItemStatus(),
                            item.getSentToKitchenAt(),
                            item.getCompletedAt()
                    );

            itemResponses.add(itemResponse);
        }

        return new OrderResponse(
                order.getOrderId(),
                order.getOrderCode(),
                order.getUserId(),
                username,
                order.getTableId(),
                tableCode,
                order.getOrderType(),
                order.getOrderStatus(),
                order.getDeliveryAddress(),
                order.getCustomerNote(),
                order.getSubtotal(),
                order.getDiscountAmount(),
                order.getDeliveryFee(),
                order.getTotalAmount(),
                order.getCreatedAt(),
                order.getUpdatedAt(),
                itemResponses
        );
    }
}