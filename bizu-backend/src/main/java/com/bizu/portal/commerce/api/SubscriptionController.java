package com.bizu.portal.commerce.api;

import com.bizu.portal.commerce.domain.Subscription;
import com.bizu.portal.commerce.infrastructure.SubscriptionRepository;
import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.identity.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/subscriptions")
@RequiredArgsConstructor
public class SubscriptionController {

    private final SubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;
    private final UserService userService;
    private final com.bizu.portal.commerce.infrastructure.PaymentRepository paymentRepository;

    @GetMapping("/me")
    public ResponseEntity<Subscription> getMySubscription(@AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        return subscriptionRepository.findFirstByUserIdAndStatusInOrderByCreatedAtDesc(userId, 
                java.util.List.of("ACTIVE", "PAST_DUE", "TRIALING", "active", "trialing", "paid", "PAID"))
            .map(ResponseEntity::ok)
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/me/history")
    public ResponseEntity<java.util.List<Subscription>> getMySubscriptionHistory(@AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(subscriptionRepository.findAllByUserId(userId));
    }

    @GetMapping("/me/payments")
    public ResponseEntity<java.util.List<com.bizu.portal.commerce.domain.Payment>> getMyPayments(@AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(paymentRepository.findByUserIdOrderByCreatedAtDesc(userId));
    }

    @PostMapping("/me/cancel")
    public ResponseEntity<?> cancelSubscription(@AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        Subscription sub = subscriptionRepository.findFirstByUserIdAndStatusInOrderByCreatedAtDesc(userId, 
                java.util.List.of("ACTIVE", "TRIALING", "active", "trialing"))
            .orElseThrow(() -> new RuntimeException("Nenhuma assinatura ativa encontrada"));
        
        sub.setCancelAtPeriodEnd(true);
        subscriptionRepository.save(sub);
        return ResponseEntity.ok(java.util.Map.of("message", "Sua assinatura será cancelada ao fim do período atual."));
    }
}
