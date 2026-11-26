
package com.example.restaurant_management.service;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

@Service
public class VietQRService {

    @Value("${vietqr.bank-id}")
    private String bankId;

    @Value("${vietqr.account-number}")
    private String accountNumber;

    @Value("${vietqr.account-name}")
    private String accountName;

    @Value("${vietqr.template}")
    private String template;

    // Tạo đường dẫn ảnh QR theo thông tin thanh toán
    public String generateQRCode(
            BigDecimal amount,
            String transferContent
    ) {

        if (amount == null || amount.compareTo(BigDecimal.ZERO) <= 0) {
            throw new IllegalArgumentException(
                    "Số tiền thanh toán phải lớn hơn 0"
            );
        }

        long amountValue = amount
                .setScale(0, RoundingMode.HALF_UP)
                .longValueExact();

        String encodedAccountName = URLEncoder.encode(
                accountName,
                StandardCharsets.UTF_8
        );

        String encodedContent = URLEncoder.encode(
                transferContent,
                StandardCharsets.UTF_8
        );

        return "https://img.vietqr.io/image/"
                + bankId + "-"
                + accountNumber + "-"
                + template
                + ".png?amount=" + amountValue
                + "&addInfo=" + encodedContent
                + "&accountName=" + encodedAccountName;
    }

    public String getBankId() {
        return bankId;
    }

    public String getAccountNumber() {
        return accountNumber;
    }

    public String getAccountName() {
        return accountName;
    }
}
