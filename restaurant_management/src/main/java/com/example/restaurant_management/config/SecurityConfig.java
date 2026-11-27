
package com.example.restaurant_management.config;

import java.util.List;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfiguration;
import org.springframework.web.cors.CorsConfigurationSource;
import org.springframework.web.cors.UrlBasedCorsConfigurationSource;

import com.example.restaurant_management.security.JwtAuthenticationFilter;

@Configuration
@EnableMethodSecurity
@EnableWebSecurity
public class SecurityConfig {

    // =========================
    // CẤU HÌNH CORS
    // =========================

    @Bean
    public CorsConfigurationSource corsConfigurationSource() {

        CorsConfiguration configuration = new CorsConfiguration();

        configuration.setAllowedOrigins(
            List.of("http://localhost:5173")
        );

        configuration.setAllowedMethods(
            List.of(
                "GET",
                "POST",
                "PUT",
                "PATCH",
                "DELETE",
                "OPTIONS"
            )
        );

        configuration.setAllowedHeaders(
            List.of(
                "Authorization",
                "Content-Type",
                "Accept"
            )
        );

        configuration.setAllowCredentials(true);

        UrlBasedCorsConfigurationSource source =
            new UrlBasedCorsConfigurationSource();

        source.registerCorsConfiguration("/**", configuration);

        return source;
    }

    // =========================
    // SECURITY FILTER CHAIN
    // =========================

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http,
            JwtAuthenticationFilter jwtAuthenticationFilter
    ) throws Exception {

        http
            .cors(cors ->
                cors.configurationSource(corsConfigurationSource())
            )

            .csrf(csrf -> csrf.disable())

            .authorizeHttpRequests(auth -> auth

                // =========================
                // ẢNH CÔNG KHAI
                // =========================

                .requestMatchers(
                    "/uploads/**",
                    "/images/**"
                ).permitAll()

                // =========================
                // ĐĂNG NHẬP VÀ ĐĂNG KÝ
                // =========================

                .requestMatchers(
                    "/api/auth/login",
                    "/api/auth/register"
                ).permitAll()

                // =========================
                // QUẢN LÝ NGƯỜI DÙNG
                // =========================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/users",
                    "/api/users/*",
                    "/api/users/username/**"
                ).hasAnyRole("ADMIN", "MANAGER")

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/users"
                ).hasAnyRole("ADMIN", "MANAGER")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/users/*"
                ).hasAnyRole("ADMIN", "MANAGER")

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/users/*/activate",
                    "/api/users/*/deactivate"
                ).hasRole("ADMIN")

                // =========================
                // QUẢN LÝ DANH MỤC
                // =========================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/categories/**"
                ).hasAnyRole(
                    "ADMIN",
                    "MANAGER",
                    "EMPLOYEE",
                    "CUSTOMER"
                )

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/categories"
                ).hasAnyRole("ADMIN", "MANAGER")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/categories/*"
                ).hasAnyRole("ADMIN", "MANAGER")

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/categories/*/activate",
                    "/api/categories/*/deactivate"
                ).hasRole("ADMIN")

                // =========================
                // QUẢN LÝ MÓN ĂN
                // =========================

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/dishes/upload"
                ).hasAnyRole("ADMIN", "MANAGER")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/dishes/**"
                ).hasAnyRole(
                    "ADMIN",
                    "MANAGER",
                    "EMPLOYEE",
                    "CUSTOMER"
                )

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/dishes"
                ).hasAnyRole("ADMIN", "MANAGER")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/dishes/*"
                ).hasAnyRole("ADMIN", "MANAGER")

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/dishes/*/activate",
                    "/api/dishes/*/deactivate"
                ).hasRole("ADMIN")

                // =========================
                // QUẢN LÝ BÀN ĂN
                // =========================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/tables/**"
                ).hasAnyRole(
                    "ADMIN",
                    "MANAGER",
                    "EMPLOYEE",
                    "CUSTOMER"
                )

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/tables"
                ).hasAnyRole("ADMIN", "MANAGER")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/tables/*"
                ).hasAnyRole("ADMIN", "MANAGER")

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/tables/*/activate",
                    "/api/tables/*/deactivate"
                ).hasRole("ADMIN")

                // =========================
                // QUẢN LÝ ĐẶT BÀN
                // =========================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/reservations/my"
                ).hasRole("CUSTOMER")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/reservations"
                ).hasAnyRole("ADMIN", "MANAGER")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/reservations/*"
                ).hasAnyRole("ADMIN", "MANAGER")

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/reservations"
                ).hasAnyRole("ADMIN", "MANAGER", "CUSTOMER")

                .requestMatchers(
                    HttpMethod.PUT,
                    "/api/reservations/*"
                ).hasAnyRole("ADMIN", "MANAGER", "CUSTOMER")

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/reservations/*/cancel"
                ).hasAnyRole("ADMIN", "MANAGER", "CUSTOMER")

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/reservations/*/confirm",
                    "/api/reservations/*/seat",
                    "/api/reservations/*/complete",
                    "/api/reservations/*/no-show"
                ).hasAnyRole("ADMIN", "MANAGER")

                // =========================
                // QUẢN LÝ ĐƠN HÀNG
                // =========================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/orders/my"
                ).hasRole("CUSTOMER")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/orders",
                    "/api/orders/*"
                ).hasAnyRole("ADMIN", "MANAGER", "EMPLOYEE")

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/orders"
                ).hasAnyRole(
                    "ADMIN",
                    "MANAGER",
                    "EMPLOYEE",
                    "CUSTOMER"
                )

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/orders/*/cancel"
                ).hasAnyRole("ADMIN", "MANAGER", "EMPLOYEE")

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/orders/*/confirm",
                    "/api/orders/*/preparing",
                    "/api/orders/*/ready",
                    "/api/orders/*/complete"
                ).hasAnyRole("ADMIN", "MANAGER", "EMPLOYEE")

                // =========================
                // XỬ LÝ TẠI BẾP
                // =========================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/kitchen/items"
                ).hasAnyRole("ADMIN", "MANAGER", "EMPLOYEE")

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/kitchen/items/*/preparing",
                    "/api/kitchen/items/*/complete"
                ).hasAnyRole("ADMIN", "MANAGER", "EMPLOYEE")

                // =========================
                // QUẢN LÝ THANH TOÁN
                // =========================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/payments",
                    "/api/payments/*"
                ).hasAnyRole("ADMIN", "MANAGER", "EMPLOYEE")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/payments/order/*"
                ).hasAnyRole(
                    "ADMIN",
                    "MANAGER",
                    "EMPLOYEE",
                    "CUSTOMER"
                )

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/payments"
                ).hasAnyRole(
                    "ADMIN",
                    "MANAGER",
                    "EMPLOYEE",
                    "CUSTOMER"
                )

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/payments/*/confirm",
                    "/api/payments/*/fail"
                ).hasAnyRole("ADMIN", "MANAGER", "EMPLOYEE")

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/payments/*/refund"
                ).hasAnyRole("ADMIN", "MANAGER")

                // =========================
                // WEBHOOK VIETQR
                // =========================

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/webhooks/payments/vietqr"
                ).permitAll()

                // =========================
                // PHẢN HỒI KHÁCH HÀNG
                // =========================

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/feedbacks/order/**"
                ).hasRole("CUSTOMER")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/feedbacks"
                ).hasAnyRole("ADMIN", "MANAGER")

                .requestMatchers(
                    HttpMethod.GET,
                    "/api/feedbacks/**"
                ).hasAnyRole("ADMIN", "MANAGER")

                .requestMatchers(
                    HttpMethod.POST,
                    "/api/feedbacks"
                ).hasRole("CUSTOMER")

                .requestMatchers(
                    HttpMethod.PATCH,
                    "/api/feedbacks/**"
                ).hasAnyRole("ADMIN", "MANAGER")

                // =========================
                // THỐNG KÊ
                // =========================

                .requestMatchers(
                    "/api/statistics/**"
                ).hasAnyRole("ADMIN", "MANAGER")
                .requestMatchers(
    "/api/auth/login",
    "/api/auth/register",
    "/api/auth/forgot-password"
).permitAll()

                // =========================
                // API CÒN LẠI
                // =========================

                .anyRequest().authenticated()
            )

            // =========================
            // XỬ LÝ LỖI XÁC THỰC
            // =========================

            .exceptionHandling(exception -> exception
                .authenticationEntryPoint(
                    new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)
                )
            )

            // =========================
            // TẮT FORM LOGIN VÀ HTTP BASIC
            // =========================

            .formLogin(form -> form.disable())

            .httpBasic(basic -> basic.disable())

            // =========================
            // JWT STATELESS
            // =========================

            .sessionManagement(session -> session
                .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
            )

            .addFilterBefore(
                jwtAuthenticationFilter,
                UsernamePasswordAuthenticationFilter.class
            );

        return http.build();
    }

    // =========================
    // PASSWORD ENCODER
    // =========================

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
