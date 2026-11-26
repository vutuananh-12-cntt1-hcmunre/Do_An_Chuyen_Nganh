
package com.example.restaurant_management.service.impl;

import java.util.List;

import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import com.example.restaurant_management.dto.Order;
import com.example.restaurant_management.dto.Payment;
import com.example.restaurant_management.dto.PaymentRequest;
import com.example.restaurant_management.dto.PaymentResponse;
import com.example.restaurant_management.dto.User;
import com.example.restaurant_management.repository.OrderRepository;
import com.example.restaurant_management.repository.PaymentRepository;
import com.example.restaurant_management.repository.UserRepository;
import com.example.restaurant_management.service.OrderService;
import com.example.restaurant_management.service.PaymentService;
import com.example.restaurant_management.service.VietQRService;

@Service
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final OrderRepository orderRepository;
    private final UserRepository userRepository;
    private final VietQRService vietQRService;
    private final OrderService orderService;

    public PaymentServiceImpl(
            PaymentRepository paymentRepository,
            OrderRepository orderRepository,
            UserRepository userRepository,
            VietQRService vietQRService,
            OrderService orderService) {

        this.paymentRepository = paymentRepository;
        this.orderRepository = orderRepository;
        this.userRepository = userRepository;
        this.vietQRService = vietQRService;
        this.orderService = orderService;
    }

    // Lấy thông tin người dùng hiện tại
    private User getCurrentUser() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null
                || !authentication.isAuthenticated()
                || "anonymousUser".equals(authentication.getPrincipal())) {

            throw new RuntimeException("Người dùng chưa đăng nhập");
        }

        return userRepository.findByUsername(authentication.getName())
                .orElseThrow(() ->
                        new RuntimeException("Không tìm thấy người dùng"));
    }

    // Kiểm tra người dùng có phải nhân viên hay không
    private boolean isStaff() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN")
                        || authority.getAuthority().equals("ROLE_MANAGER")
                        || authority.getAuthority().equals("ROLE_EMPLOYEE"));
    }

    // Kiểm tra người dùng có phải ADMIN hay không
    private boolean isAdmin() {

        Authentication authentication =
                SecurityContextHolder.getContext().getAuthentication();

        if (authentication == null) {
            return false;
        }

        return authentication.getAuthorities().stream()
                .anyMatch(authority ->
                        authority.getAuthority().equals("ROLE_ADMIN"));
    }

    // Bổ sung thông tin VietQR vào PaymentResponse
    private PaymentResponse enrichPaymentResponse(
            PaymentResponse response) {

        if (response == null) {
            return null;
        }

        /*
         * BANK_TRANSFER luôn được bổ sung thông tin VietQR,
         * kể cả khi trạng thái là PENDING hoặc SUCCESS.
         */
        if ("BANK_TRANSFER".equals(response.getPaymentMethod())) {

            String transferContent =
                    "THANHTOAN " + response.getOrderCode();

            String qrCodeUrl = vietQRService.generateQRCode(
                    response.getAmount(),
                    transferContent);

            response.setQrCodeUrl(qrCodeUrl);
            response.setBankName("Vietcombank");
            response.setAccountNumber(
                    vietQRService.getAccountNumber());
            response.setAccountName(
                    vietQRService.getAccountName());
            response.setTransferContent(transferContent);
        }

        return response;
    }

    // Lấy danh sách tất cả thanh toán
    @Override
    public List<PaymentResponse> getAllPayments() {

        List<PaymentResponse> payments =
                paymentRepository.findAll();

        for (PaymentResponse payment : payments) {
            enrichPaymentResponse(payment);
        }

        return payments;
    }

    // Lấy thanh toán theo ID
    @Override
    public PaymentResponse getPaymentById(Integer paymentId) {

        PaymentResponse payment =
                paymentRepository.findById(paymentId);

        if (payment == null) {
            throw new RuntimeException("Không tìm thấy thanh toán");
        }

        return enrichPaymentResponse(payment);
    }

    // Lấy thanh toán theo đơn hàng
    @Override
    public List<PaymentResponse> getPaymentsByOrderId(Integer orderId) {

        Order order = orderRepository.findById(orderId);

        if (order == null) {
            throw new RuntimeException("Không tìm thấy đơn hàng");
        }

        User currentUser = getCurrentUser();

        if (!isStaff()
                && !order.getUserId().equals(currentUser.getUserId())) {

            throw new RuntimeException(
                    "Bạn không có quyền xem thanh toán của đơn hàng này");
        }

        List<PaymentResponse> payments =
                paymentRepository.findByOrderId(orderId);

        for (PaymentResponse payment : payments) {
            enrichPaymentResponse(payment);
        }

        return payments;
    }

    // Tạo yêu cầu thanh toán
    @Override
    @Transactional
    public PaymentResponse createPayment(PaymentRequest request) {

        User currentUser = getCurrentUser();

        Order order = orderRepository.findById(request.getOrderId());

        if (order == null) {
            throw new RuntimeException("Không tìm thấy đơn hàng");
        }

        if (!isStaff()
                && !order.getUserId().equals(currentUser.getUserId())) {

            throw new RuntimeException(
                    "Bạn không có quyền thanh toán đơn hàng này");
        }

        if (!"CASH".equals(request.getPaymentMethod())
                && !"BANK_TRANSFER".equals(request.getPaymentMethod())) {

            throw new RuntimeException(
                    "Phương thức thanh toán không được hỗ trợ");
        }

        if ("CANCELLED".equals(order.getOrderStatus())) {
            throw new RuntimeException(
                    "Không thể thanh toán đơn hàng đã bị hủy");
        }

        if (paymentRepository.hasSuccessfulPayment(
                request.getOrderId())) {

            throw new RuntimeException(
                    "Đơn hàng đã được thanh toán thành công");
        }

        List<PaymentResponse> existingPayments =
                paymentRepository.findByOrderId(request.getOrderId());

        boolean hasPendingPayment = existingPayments.stream()
                .anyMatch(payment ->
                        "PENDING".equals(payment.getPaymentStatus()));

        if (hasPendingPayment) {
            throw new RuntimeException(
                    "Đơn hàng đã có yêu cầu thanh toán đang chờ xử lý");
        }

        Payment payment = new Payment();

        payment.setOrderId(order.getOrderId());
        payment.setPaymentMethod(request.getPaymentMethod());
        payment.setPaymentStatus("PENDING");
        payment.setAmount(order.getTotalAmount());
        payment.setTransactionCode(null);

        Integer paymentId = paymentRepository.insert(payment);

        PaymentResponse response =
                paymentRepository.findById(paymentId);

        return enrichPaymentResponse(response);
    }

    // Xác nhận thanh toán thủ công
    @Override
    @Transactional
    public void confirmPayment(Integer paymentId) {

        if (!isStaff()) {
            throw new RuntimeException(
                    "Bạn không có quyền xác nhận thanh toán");
        }

        Payment payment =
                paymentRepository.findPaymentById(paymentId);

        if (payment == null) {
            throw new RuntimeException(
                    "Không tìm thấy thanh toán");
        }

        if (!"PENDING".equals(payment.getPaymentStatus())) {
            throw new RuntimeException(
                    "Chỉ thanh toán đang chờ mới được xác nhận");
        }

        String paymentMethod = payment.getPaymentMethod();

        if (!"CASH".equals(paymentMethod)
                && !"BANK_TRANSFER".equals(paymentMethod)) {

            throw new RuntimeException(
                    "Phương thức thanh toán không được hỗ trợ");
        }

        // Chuyển khoản chỉ ADMIN được xác nhận
        if ("BANK_TRANSFER".equals(paymentMethod) && !isAdmin()) {
            throw new RuntimeException(
                    "Chỉ ADMIN mới được xác nhận thanh toán chuyển khoản");
        }

        Order order = orderRepository.findById(payment.getOrderId());

        if (order == null
                || "CANCELLED".equals(order.getOrderStatus())) {

            throw new RuntimeException(
                    "Không thể xác nhận thanh toán cho đơn hàng này");
        }

        // Cập nhật PENDING -> SUCCESS, không cần mã giao dịch
        int updated = paymentRepository.updateStatus(
                paymentId,
                "PENDING",
                "SUCCESS",
                null);

        if (updated == 0) {
            throw new RuntimeException(
                    "Thanh toán đã được xử lý hoặc không thể cập nhật");
        }

        // Đồng bộ trạng thái đơn hàng
        orderService.confirmOrder(payment.getOrderId());
    }

    // Đánh dấu thanh toán thất bại
    @Override
    @Transactional
    public void failPayment(Integer paymentId) {

        if (!isStaff()) {
            throw new RuntimeException(
                    "Bạn không có quyền cập nhật thanh toán");
        }

        Payment payment =
                paymentRepository.findPaymentById(paymentId);

        if (payment == null) {
            throw new RuntimeException(
                    "Không tìm thấy thanh toán");
        }

        if (!"PENDING".equals(payment.getPaymentStatus())) {
            throw new RuntimeException(
                    "Chỉ thanh toán đang chờ mới được đánh dấu thất bại");
        }

        int updated = paymentRepository.updateStatus(
                paymentId,
                "PENDING",
                "FAILED",
                null);

        if (updated == 0) {
            throw new RuntimeException(
                    "Không thể cập nhật trạng thái thanh toán");
        }
    }

    // Hoàn tiền
    @Override
    @Transactional
    public void refundPayment(Integer paymentId) {

        if (!isStaff()) {
            throw new RuntimeException(
                    "Bạn không có quyền hoàn tiền");
        }

        Payment payment =
                paymentRepository.findPaymentById(paymentId);

        if (payment == null) {
            throw new RuntimeException(
                    "Không tìm thấy thanh toán");
        }

        if (!"SUCCESS".equals(payment.getPaymentStatus())) {
            throw new RuntimeException(
                    "Chỉ thanh toán thành công mới được hoàn tiền");
        }

        int updated = paymentRepository.updateStatus(
                paymentId,
                "SUCCESS",
                "REFUNDED",
                null);

        if (updated == 0) {
            throw new RuntimeException(
                    "Không thể cập nhật trạng thái hoàn tiền");
        }
    }
}
