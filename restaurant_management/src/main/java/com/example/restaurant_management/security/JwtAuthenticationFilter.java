
package com.example.restaurant_management.security;

import java.io.IOException;
import java.util.List;
import java.util.stream.Collectors;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import io.jsonwebtoken.Claims;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log =
            LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {

        String uri = request.getRequestURI();

        // Không xác thực JWT khi tải ảnh công khai
        return uri.startsWith("/uploads/")
                || uri.startsWith("/images/");
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorizationHeader =
                request.getHeader("Authorization");

        // Không có token: để Spring Security tự xử lý quyền truy cập
        if (authorizationHeader == null
                || authorizationHeader.isBlank()
                || !authorizationHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        String token = authorizationHeader.substring(7).trim();

        if (token.isBlank()) {
            filterChain.doFilter(request, response);
            return;
        }

        try {
            Claims claims = jwtService.extractAllClaims(token);

            String username = claims.getSubject();

            if (username == null || username.isBlank()) {
                throw new IllegalArgumentException(
                        "JWT không chứa username"
                );
            }

            List<?> roles = claims.get("roles", List.class);

            if (roles == null || roles.isEmpty()) {
                throw new IllegalArgumentException(
                        "JWT không chứa roles"
                );
            }

            var authorities = roles.stream()
                    .map(role -> {
                        String roleName = role.toString();

                        if (!roleName.startsWith("ROLE_")) {
                            roleName = "ROLE_" + roleName;
                        }

                        return new SimpleGrantedAuthority(roleName);
                    })
                    .collect(Collectors.toList());

            var authentication =
                    new UsernamePasswordAuthenticationToken(
                            username,
                            null,
                            authorities
                    );

            SecurityContextHolder.getContext()
                    .setAuthentication(authentication);

            log.debug(
                    "JWT authentication thành công. Username: {}, Roles: {}",
                    username,
                    authorities
            );

        } catch (Exception ex) {

            log.warn(
                    "JWT không hợp lệ. URI: {}, Lỗi: {}",
                    request.getRequestURI(),
                    ex.getMessage()
            );

            SecurityContextHolder.clearContext();
        }

        filterChain.doFilter(request, response);
    }
}
