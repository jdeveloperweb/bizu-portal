package com.bizu.portal.identity.api;

import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.identity.domain.User;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/public/auth")
@RequiredArgsConstructor
public class PublicAuthController {

    private final UserService userService;

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            User user = userService.registerUser(request.getName(), request.getEmail(), request.getPassword());
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Data
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password; // Recebido mas não armazenado localmente por enquanto (Keycloak deve lidar futuramente)
    }
}
