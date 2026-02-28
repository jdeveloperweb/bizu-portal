package com.bizu.portal.commerce.api;

import com.bizu.portal.commerce.application.PaymentService;
import com.bizu.portal.commerce.domain.Plan;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.application.UserService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/checkout")
@RequiredArgsConstructor
public class CheckoutController {

    private final PaymentService paymentService;
    private final UserService userService;

    @PostMapping("/create-session")
    public ResponseEntity<?> createSession(@AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt, @RequestBody CheckoutRequest request) {
        User user = userService.resolveUser(jwt);
        
        java.util.Map<String, Object> result = paymentService.initiatePayment(
            user, 
            request.getAmount(), 
            request.getProvider(), 
            request.getMethod(),
            request.getPlanId()
        );
        
        return ResponseEntity.ok(result);
    }

    @PostMapping("/confirm")
    public ResponseEntity<?> confirmPayment(@AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt, @RequestBody Map<String, String> body) {
        UUID userId = userService.resolveUserId(jwt);
        UUID planId = UUID.fromString(body.get("planId"));
        paymentService.activateSubscription(userId, planId);
        return ResponseEntity.ok(Map.of("message", "Pagamento confirmado e plano ativado!"));
    }

    @Data
    public static class CheckoutRequest {
        private UUID planId;
        private java.math.BigDecimal amount;
        private String provider; // STRIPE, MERCADO_PAGO
        private String method; // PIX, CARD
    }
}
