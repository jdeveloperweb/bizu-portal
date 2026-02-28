package com.bizu.portal.identity.api;

import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.notification.application.VerificationService;
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
    private final VerificationService verificationService;

    @PostMapping("/send-verification-code")
    public ResponseEntity<?> sendVerificationCode(@RequestBody SendCodeRequest request) {
        try {
            if ("EMAIL".equalsIgnoreCase(request.getType())) {
                verificationService.generateAndSendCode(request.getRecipient(), request.getName(), "EMAIL");
            } else if ("WHATSAPP".equalsIgnoreCase(request.getType())) {
                verificationService.generateAndSendCode(request.getRecipient(), request.getName(), "WHATSAPP");
            }
            return ResponseEntity.ok().build();
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Erro ao enviar código: " + e.getMessage());
        }
    }

    @PostMapping("/register")
    public ResponseEntity<?> register(@RequestBody RegisterRequest request) {
        try {
            // Validate EMAIL code
            if (request.getEmailCode() == null || !verificationService.validateCode(request.getEmail(), "EMAIL", request.getEmailCode())) {
                return ResponseEntity.badRequest().body("Código de e-mail inválido ou expirado.");
            }
            
            // Validate WHATSAPP code
            if (request.getPhoneCode() == null || !verificationService.validateCode(request.getPhone(), "WHATSAPP", request.getPhoneCode())) {
                return ResponseEntity.badRequest().body("Código de WhatsApp inválido ou expirado.");
            }

            User user = userService.registerUser(request.getName(), request.getEmail(), request.getPassword(), request.getPhone());
            return ResponseEntity.ok(user);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(e.getMessage());
        }
    }

    @Data
    public static class SendCodeRequest {
        private String recipient; // Email or Phone
        private String name;
        private String type; // EMAIL or WHATSAPP
    }

    @Data
    public static class RegisterRequest {
        private String name;
        private String email;
        private String password;
        private String phone;
        private String emailCode;
        private String phoneCode;
    }
}
