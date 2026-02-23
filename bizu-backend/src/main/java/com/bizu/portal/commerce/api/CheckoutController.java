package com.bizu.portal.commerce.api;

import com.bizu.portal.commerce.application.PaymentService;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/checkout")
@RequiredArgsConstructor
public class CheckoutController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    @PostMapping("/create-session")
    public ResponseEntity<Map<String, String>> createCheckoutSession(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody Map<String, Object> request) {
        
        UUID userId = UUID.fromString(jwt.getSubject());
        User user = userRepository.findById(userId).orElseThrow();
        
        BigDecimal amount = new BigDecimal(request.get("amount").toString());
        String provider = (String) request.getOrDefault("provider", "STRIPE");

        String checkoutUrl = paymentService.initiatePayment(user, amount, provider);

        return ResponseEntity.ok(Map.of("checkoutUrl", "https://checkout.bizuportal.com.br/pay/" + checkoutUrl));
    }
}
