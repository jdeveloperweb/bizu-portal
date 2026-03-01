package com.bizu.portal.shared.security;

import com.bizu.portal.identity.application.DeviceService;
import com.bizu.portal.identity.application.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.server.resource.authentication.JwtAuthenticationToken;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class DeviceValidationFilter extends OncePerRequestFilter {

    public static final String DEVICE_HEADER = "X-Device-Fingerprint";
    private final DeviceService deviceService;
    private final UserService userService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                     FilterChain filterChain) throws ServletException, IOException {
        
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        
        if (auth instanceof JwtAuthenticationToken jwtAuth) {
            UUID userId = userService.resolveUserId(jwtAuth.getToken());
            String fingerprint = request.getHeader(DEVICE_HEADER);

            // Se for endpoint de registro de dispositivo, não validamos o fingerprint ainda
            if (request.getRequestURI().equals("/api/v1/devices/register")) {
                filterChain.doFilter(request, response);
                return;
            }

            if (userId != null) {
                boolean isAdmin = auth.getAuthorities().stream()
                        .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
                
                if (!isAdmin && !deviceService.isValidDevice(userId, fingerprint)) {
                    log.warn("Tentativa de acesso de dispositivo não autorizado para o usuário {}. Fingerprint recebida: {}", userId, fingerprint);
                    response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                    response.setContentType("application/json");
                    response.getWriter().write("{\"error\": \"DEVICE_MISMATCH\", \"message\": \"Este dispositivo não está autorizado. Faça login novamente para vincular este dispositivo.\"}");
                    return;
                }
            }
        }

        filterChain.doFilter(request, response);
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) {
        String path = request.getRequestURI();
        return path.startsWith("/api/v1/public/") || 
               path.startsWith("/api/v1/admin/branding/active") ||
               path.startsWith("/api/v1/public/auth") ||
               path.startsWith("/ws");
    }
}
