
package com.example.restaurant_management.config;

import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import com.example.restaurant_management.security.JwtAuthenticationFilter;

@Configuration
public class JwtFilterRegistrationConfig {

    /**
     * Không cho Spring Boot đăng ký JWT Filter ở cấp Servlet.
     * JWT Filter chỉ được chạy bên trong Spring Security Filter Chain.
     */
    @Bean
    public FilterRegistrationBean<JwtAuthenticationFilter>
            jwtAuthenticationFilterRegistration(
                    JwtAuthenticationFilter jwtAuthenticationFilter) {

        FilterRegistrationBean<JwtAuthenticationFilter> registration =
                new FilterRegistrationBean<>();

        registration.setFilter(jwtAuthenticationFilter);
        registration.setEnabled(false);

        return registration;
    }
}
