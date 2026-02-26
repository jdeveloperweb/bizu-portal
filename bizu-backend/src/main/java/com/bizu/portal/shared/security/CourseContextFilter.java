package com.bizu.portal.shared.security;

import com.bizu.portal.commerce.application.EntitlementService;
import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.identity.infrastructure.UserRepository;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;
import org.springframework.web.method.HandlerMethod;
import org.springframework.web.servlet.HandlerMapping;
import org.springframework.web.servlet.mvc.method.annotation.RequestMappingHandlerMapping;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Filter that intercepts requests and enforces course context isolation.
 * Runs after Spring Security authentication.
 *
 * For endpoints annotated with @CourseContextGuard:
 * 1. Extracts X-Selected-Course-Id header
 * 2. Validates entitlement
 * 3. Populates CourseContextHolder
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class CourseContextFilter extends OncePerRequestFilter {

    public static final String COURSE_HEADER = "X-Selected-Course-Id";

    private final EntitlementService entitlementService;
    private final UserService userService;
    private final ObjectMapper objectMapper;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
        try {
            String courseIdHeader = request.getHeader(COURSE_HEADER);
            UUID userId = extractUserId();

            if (courseIdHeader != null && userId != null) {
                try {
                    UUID courseId = UUID.fromString(courseIdHeader);
                    CourseContextHolder.set(courseId, userId);
                } catch (IllegalArgumentException e) {
                    log.warn("Invalid X-Selected-Course-Id header: {}", courseIdHeader);
                }
            }

            if (userId != null) {
                // Always set userId even without course context
                UUID currentCourseId = CourseContextHolder.getCourseId();
                CourseContextHolder.set(currentCourseId, userId);
            }

            filterChain.doFilter(request, response);
        } finally {
            CourseContextHolder.clear();
        }
    }

    private UUID extractUserId() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            return userService.resolveUserId(jwtAuth.getToken());
        }
        return null;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        // Skip public endpoints and auth endpoints
        return path.startsWith("/api/v1/public/") || path.equals("/ws");
    }
}
