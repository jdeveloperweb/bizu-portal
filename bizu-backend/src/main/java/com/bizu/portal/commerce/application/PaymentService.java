package com.bizu.portal.commerce.application;

import com.bizu.portal.commerce.domain.Plan;
import com.bizu.portal.commerce.domain.Subscription;
import com.bizu.portal.commerce.domain.SubscriptionGroup;
import com.bizu.portal.commerce.infrastructure.PlanRepository;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.UserRepository;
import com.bizu.portal.student.application.NotificationService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
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
    private final com.bizu.portal.admin.application.SystemSettingsService settingsService;
    private final com.bizu.portal.commerce.infrastructure.SubscriptionRepository subscriptionRepository;
    private final EntitlementService entitlementService;

    public String initiatePayment(User user, BigDecimal amount, String provider) {
        com.bizu.portal.admin.domain.SystemSettings settings = settingsService.getSettings();
        
        log.info("Iniciando pagamento via {} para usuário {} — valor: R$ {}", provider, user.getEmail(), amount);

        if ("STRIPE".equals(provider) && settings.getStripeSecretKey() != null && !settings.getStripeSecretKey().isEmpty()) {
            // Aqui entraria a integração real com Stripe SDK
            // Por enquanto, simulamos o retorno de uma URL ou ID
            log.info("Chave Stripe detectada. Preparando checkout real...");
            return "stripe_session_" + UUID.randomUUID().toString();
        } else if ("MERCADO_PAGO".equals(provider) && settings.getMpAccessToken() != null && !settings.getMpAccessToken().isEmpty()) {
            log.info("Chave Mercado Pago detectada. Preparando checkout real...");
            return "mp_init_point_" + UUID.randomUUID().toString();
        }

        // Simulação se não houver chaves
        log.warn("Nenhuma chave configurada para {}. Seguindo fluxo SIMULADO.", provider);
        return "simulated_" + UUID.randomUUID().toString();
    }

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

        // Calcular data de expiração
        int monthsCount = 1;
        String interval = plan.getBillingInterval() != null ? plan.getBillingInterval().toUpperCase() : "MONTHLY";
        
        if ("YEARLY".equals(interval)) monthsCount = 12;
        else if ("SEMESTRAL".equals(interval)) monthsCount = 6;
        else if ("ONE_TIME".equals(interval) || plan.isFree()) monthsCount = 1200; // 100 anos (vitalício)
        
        OffsetDateTime expiresAt = OffsetDateTime.now().plusMonths(monthsCount);

        // Criar ou atualizar Assinatura
        Subscription subscription = Subscription.builder()
                .user(user)
                .plan(plan)
                .status("ACTIVE")
                .currentPeriodStart(OffsetDateTime.now())
                .currentPeriodEnd(expiresAt)
                .build();
        
        subscription = subscriptionRepository.save(subscription);

        // Garantir o entitlement (acesso) ao curso vinculado ao plano
        if (plan.getCourse() != null) {
            entitlementService.grantFromSubscription(user, plan.getCourse(), subscription);
            
            // Atualizar metadados do usuário para selecionar o curso automaticamente
            java.util.Map<String, Object> metadata = user.getMetadata() != null 
                ? new java.util.HashMap<>(user.getMetadata()) 
                : new java.util.HashMap<>();
            metadata.put("selectedCourseId", plan.getCourse().getId().toString());
            user.setMetadata(metadata);
        }

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
