
package com.example.restaurant_management.service.impl;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;

import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import com.example.restaurant_management.dto.Invoice;
import com.example.restaurant_management.dto.InvoiceResponse;
import com.example.restaurant_management.dto.Order;
import com.example.restaurant_management.repository.InvoiceRepository;
import com.example.restaurant_management.repository.OrderRepository;
import com.example.restaurant_management.repository.PaymentRepository;
import com.example.restaurant_management.service.InvoiceService;

@Service
public class InvoiceServiceImpl implements InvoiceService {

    private final InvoiceRepository invoiceRepository;
    private final OrderRepository orderRepository;
    private final PaymentRepository paymentRepository;

    public InvoiceServiceImpl(
            InvoiceRepository invoiceRepository,
            OrderRepository orderRepository,
            PaymentRepository paymentRepository
    ) {
        this.invoiceRepository = invoiceRepository;
        this.orderRepository = orderRepository;
        this.paymentRepository = paymentRepository;
    }

    // Lấy danh sách hóa đơn
    @Override
    public List<InvoiceResponse> getAllInvoices() {
        return invoiceRepository.findAll();
    }

    // Lấy hóa đơn theo ID
    @Override
    public InvoiceResponse getInvoiceById(Integer invoiceId) {

        InvoiceResponse invoice = invoiceRepository.findById(invoiceId);

        if (invoice == null) {
            throw new RuntimeException("Không tìm thấy hóa đơn");
        }

        return invoice;
    }

    // Lấy hóa đơn theo ID đơn hàng
    @Override
    public InvoiceResponse getInvoiceByOrderId(Integer orderId) {

        InvoiceResponse invoice =
                invoiceRepository.findByOrderId(orderId);

        if (invoice == null) {
            throw new RuntimeException(
                    "Đơn hàng chưa có hóa đơn"
            );
        }

        return invoice;
    }

    // Tạo hóa đơn từ đơn hàng đã thanh toán
    @Override
    @Transactional
    public InvoiceResponse createInvoice(Integer orderId) {

        // 1. Kiểm tra đơn hàng có tồn tại không
        Order order = orderRepository.findById(orderId);

        if (order == null) {
            throw new RuntimeException(
                    "Không tìm thấy đơn hàng"
            );
        }

        // 2. Kiểm tra đơn hàng đã thanh toán thành công chưa
        boolean isPaid =
                paymentRepository.hasSuccessfulPayment(orderId);

        if (!isPaid) {
            throw new ResponseStatusException(
            HttpStatus.BAD_REQUEST,
            "Không thể tạo hóa đơn khi đơn hàng chưa thanh toán thành công"
    );
}

        // 3. Kiểm tra hóa đơn đã tồn tại chưa
        if (invoiceRepository.existsByOrderId(orderId)) {
            throw new ResponseStatusException(
            HttpStatus.CONFLICT,
            "Đơn hàng này đã có hóa đơn"
    );
}

        // 4. Tạo đối tượng Invoice
        Invoice invoice = new Invoice();

        invoice.setInvoiceCode(generateInvoiceCode());
        invoice.setOrderId(orderId);
        invoice.setInvoiceStatus("ISSUED");

        // 5. Lấy thông tin tiền từ đơn hàng
        invoice.setSubtotal(order.getSubtotal());

        invoice.setDiscountAmount(
                order.getDiscountAmount() != null
                        ? order.getDiscountAmount()
                        : BigDecimal.ZERO
        );

        // Hiện tại hệ thống chưa tính thuế riêng
        invoice.setTaxAmount(BigDecimal.ZERO);

        // Tổng tiền lấy trực tiếp từ đơn hàng
        invoice.setTotalAmount(order.getTotalAmount());

        // 6. Lưu hóa đơn vào database
        Integer invoiceId = invoiceRepository.insert(invoice);

        // 7. Trả về thông tin hóa đơn vừa tạo
        return invoiceRepository.findById(invoiceId);
    }

    // Sinh mã hóa đơn tự động
    private String generateInvoiceCode() {

        String randomCode = UUID.randomUUID()
                .toString()
                .replace("-", "")
                .substring(0, 8)
                .toUpperCase();

        return "INV" + randomCode;
    }
}
