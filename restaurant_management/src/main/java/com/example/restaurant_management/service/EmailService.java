package com.example.restaurant_management.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;

    @Value("${app.mail.from-name:Bếp Mận & Lửa}")
    private String fromName;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendTemporaryPassword(
            String toEmail,
            String fullName,
            String username,
            String temporaryPassword) {

        SimpleMailMessage message = new SimpleMailMessage();
        message.setFrom(fromEmail);
        message.setTo(toEmail);
        message.setSubject("[Bếp Mận & Lửa] Mật khẩu tạm thời");

        String displayName =
            (fullName != null && !fullName.isBlank())
                ? fullName
                : username;

        message.setText(
            "Xin chào " + displayName + ",\n\n"
                + "Bạn (hoặc ai đó) đã yêu cầu đặt lại mật khẩu tài khoản nhà hàng Bếp Mận & Lửa.\n\n"
                + "Tên đăng nhập: " + username + "\n"
                + "Mật khẩu tạm thời: " + temporaryPassword + "\n\n"
                + "Vui lòng đăng nhập bằng mật khẩu tạm thời này, sau đó vào Hồ sơ > Đổi mật khẩu để đặt mật khẩu mới.\n\n"
                + "Nếu bạn không yêu cầu, hãy đổi mật khẩu ngay sau khi đăng nhập.\n\n"
                + "Trân trọng,\n"
                + fromName
        );

        mailSender.send(message);
    }
}
