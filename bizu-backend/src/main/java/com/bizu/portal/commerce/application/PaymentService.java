package com.bizu.portal.commerce.application;

import com.bizu.portal.commerce.domain.Plan;
import com.bizu.portal.commerce.domain.SubscriptionGroup;
import com.bizu.portal.commerce.infrastructure.PlanRepository;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.UserRepository;
import com.bizu.portal.student.application.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class PaymentService {

    private final UserRepository userRepository;
    private final PlanRepository planRepository;
    private final SubscriptionGroupService subscriptionGroupService;
    private final NotificationService notificationService;
    private final CouponService couponService;

    @Transactional
    public void processStripeEvent(String payload, String sigHeader) {
        // Em um sistema real, usaríamos o Stripe Java SDK:
        // Event event = Webhook.constructEvent(payload, sigHeader, endpointSecret);
        
        // Simulação de processamento de checkout.session.completed
        log.info("Simulando ativação de plano via Webhook Stripe");
        
        // Supondo que pegamos o userId e planId dos metadados do Stripe
        // UUID userId = ...;
        // UUID planId = ...;
        
        // setPlanToUser(userId, planId);
    }

    @Transactional
    public void activateSubscription(UUID userId, UUID planId) {
        User user = userRepository.findById(userId).orElseThrow();
        Plan plan = planRepository.findById(planId).orElseThrow();

        log.info("Ativando plano {} para usuário {}", plan.getName(), user.getEmail());

        if (plan.isGroup()) {
            subscriptionGroupService.createGroup(user, plan);
        }

        // Logic to update user metadata or role to ACTIVE_SUBSCRIBER
        user.setStatus("ACTIVE_SUBSCRIBER");
        userRepository.save(user);

        notificationService.send(userId, "🚀 Assinatura Ativada!", 
            "Seja bem-vindo ao Bizu! Seu plano " + plan.getName() + " já está ativo e pronto para uso.");
    }

    public java.math.BigDecimal calculateFinalPrice(java.math.BigDecimal originalPrice, String couponCode) {
        if (couponCode == null || couponCode.isEmpty()) return originalPrice;

        com.bizu.portal.commerce.domain.Coupon coupon = couponService.validateCoupon(couponCode);
        
        java.math.BigDecimal finalPrice;
        if ("PERCENTAGE".equals(coupon.getType())) {
            java.math.BigDecimal discount = originalPrice.multiply(coupon.getValue()).divide(new java.math.BigDecimal(100));
            finalPrice = originalPrice.subtract(discount);
        } else {
            finalPrice = originalPrice.subtract(coupon.getValue());
        }

        return finalPrice.max(java.math.BigDecimal.ZERO);
    }
}
