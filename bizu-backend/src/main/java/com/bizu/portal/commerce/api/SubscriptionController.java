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
import org.springframework.web.bind.annotation.PostMapping;
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
    private final com.bizu.portal.commerce.application.PlanService planService;
    private final com.bizu.portal.commerce.application.PaymentService paymentService;

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

    @GetMapping("/me/upgrade-preview")
    public ResponseEntity<?> previewUpgrade(@AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt, 
                                          @org.springframework.web.bind.annotation.RequestParam UUID newPlanId) {
        UUID userId = userService.resolveUserId(jwt);
        Subscription currentSub = subscriptionRepository.findFirstByUserIdAndStatusInOrderByCreatedAtDesc(userId, 
                java.util.List.of("ACTIVE", "PAST_DUE", "active", "PAID"))
            .orElseThrow(() -> new RuntimeException("Nenhuma assinatura ativa encontrada"));
        
        com.bizu.portal.commerce.domain.Plan newPlan = planService.findById(newPlanId);
        java.math.BigDecimal upgradePrice = paymentService.calculateUpgradePrice(currentSub, newPlan);
        
        return ResponseEntity.ok(java.util.Map.of(
            "currentPlan", currentSub.getPlan().getName(),
            "newPlan", newPlan.getName(),
            "upgradePrice", upgradePrice,
            "currency", newPlan.getCurrency()
        ));
    }

    @PostMapping("/me/upgrade")
    public ResponseEntity<?> upgradeSubscription(@AuthenticationPrincipal org.springframework.security.oauth2.jwt.Jwt jwt, 
                                               @org.springframework.web.bind.annotation.RequestParam UUID newPlanId,
                                               @org.springframework.web.bind.annotation.RequestParam(required = false) String provider) {
        UUID userId = userService.resolveUserId(jwt);
        com.bizu.portal.identity.domain.User user = userRepository.findById(userId).orElseThrow();
        
        java.util.Map<String, Object> result = paymentService.initiateUpgrade(user, newPlanId, provider);
        return ResponseEntity.ok(result);
    }
}
