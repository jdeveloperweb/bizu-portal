package com.bizu.portal.commerce.application;

import com.bizu.portal.commerce.domain.Plan;
import com.bizu.portal.commerce.domain.Subscription;
import com.bizu.portal.commerce.domain.SubscriptionGroup;
import com.bizu.portal.commerce.infrastructure.PlanRepository;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.UserRepository;
import com.bizu.portal.student.application.NotificationService;
import com.bizu.portal.notification.application.EmailService;
import com.bizu.portal.notification.application.WhatsAppService;
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
    private final EmailService emailService;
    private final WhatsAppService whatsAppService;
    private final CouponService couponService;
    private final com.bizu.portal.admin.application.SystemSettingsService settingsService;
    private final com.bizu.portal.commerce.infrastructure.SubscriptionRepository subscriptionRepository;
    private final EntitlementService entitlementService;
    private final com.bizu.portal.commerce.infrastructure.PaymentRepository paymentRepository;
    private final java.util.List<PaymentProvider> providers;

    @Transactional
    public java.util.Map<String, Object> initiatePayment(User user, BigDecimal amount, String providerName, String method, UUID planId) {
        com.bizu.portal.admin.domain.SystemSettings settings = settingsService.getSettings();
        Plan plan = planRepository.findById(planId).orElseThrow();
        String finalProvider = providerName;
        if (finalProvider == null || finalProvider.isEmpty() || "AUTO".equalsIgnoreCase(finalProvider)) {
            finalProvider = settings.getPreferredPaymentGateway();
        }
        
        if (finalProvider == null) finalProvider = "MERCADO_PAGO"; // Default fallback

        log.info("Iniciando pagamento via {} ({}) para usuário {} — valor: R$ {}", finalProvider, method, user.getEmail(), amount);

        String providerSearch = finalProvider;
        PaymentProvider provider = providers.stream()
                .filter(p -> p.getProviderName().equalsIgnoreCase(providerSearch))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Provedor não suportado: " + providerSearch));

        java.util.Map<String, Object> result = provider.createPayment(user, amount, method, plan, settings);
        
        final String usedProvider = finalProvider;

        // Salvar registro de pagamento pendente
        com.bizu.portal.commerce.domain.Payment payment = com.bizu.portal.commerce.domain.Payment.builder()
                .user(user)
                .amount(amount)
                .status("PENDING")
                .paymentMethod(method + " (" + usedProvider + ")")
                .plan(plan)
                .checkoutUrl(result.get("url") != null ? result.get("url").toString() : null)
                .stripeIntentId(result.get("id") != null ? result.get("id").toString() : null)
                .build();
        paymentRepository.save(payment);

        // Send Pending Notifications
        try {
            String checkoutUrl = (String) result.get("url");
            if (checkoutUrl != null) {
                emailService.sendPaymentPendingEmail(user.getEmail(), user.getName(), plan.getName(), checkoutUrl);
                
                if (user.getPhone() != null && !user.getPhone().isEmpty()) {
                    whatsAppService.sendPaymentPending(user.getPhone(), user.getName(), checkoutUrl);
                }
            }
        } catch (Exception e) {
            log.warn("Failed to send pending payment notifications for user {}: {}", user.getEmail(), e.getMessage());
        }

        return result;
    }

    @Transactional
    public void processStripeEvent(String payload, String sigHeader) {
        com.bizu.portal.admin.domain.SystemSettings settings = settingsService.getSettings();
        try {
            com.stripe.model.Event event = com.stripe.net.Webhook.constructEvent(
                    payload, sigHeader, settings.getStripeWebhookSecret());

            if ("checkout.session.completed".equals(event.getType())) {
                com.stripe.model.checkout.Session session = (com.stripe.model.checkout.Session) event.getDataObjectDeserializer().getObject().orElseThrow();
                
                UUID userId = UUID.fromString(session.getMetadata().get("user_id"));
                UUID planId = UUID.fromString(session.getMetadata().get("plan_id"));
                
                activateSubscription(userId, planId);
            }
        } catch (Exception e) {
            log.error("Erro ao processar evento Stripe", e);
            throw new RuntimeException("Erro no Webhook Stripe");
        }
    }

    @Transactional
    public void processMercadoPagoEvent(String paymentId) {
        com.bizu.portal.admin.domain.SystemSettings settings = settingsService.getSettings();
        try {
            com.mercadopago.MercadoPagoConfig.setAccessToken(settings.getMpAccessToken());
            com.mercadopago.client.payment.PaymentClient client = new com.mercadopago.client.payment.PaymentClient();
            com.mercadopago.resources.payment.Payment payment = client.get(Long.parseLong(paymentId));

            if ("approved".equalsIgnoreCase(payment.getStatus())) {
                UUID userId = UUID.fromString(payment.getMetadata().get("user_id").toString());
                UUID planId = UUID.fromString(payment.getMetadata().get("plan_id").toString());
                
                activateSubscription(userId, planId);
            }
        } catch (Exception e) {
            log.error("Erro ao processar evento Mercado Pago", e);
        }
    }

    @Transactional
    public void activateSubscription(UUID userId, UUID planId) {
        User user = userRepository.findById(userId).orElseThrow();
        Plan plan = planRepository.findById(planId).orElseThrow();

        log.info("Ativando plano {} para usuário {}", plan.getName(), user.getEmail());

        java.util.List<Subscription> existingSubs = subscriptionRepository.findAllByUserId(userId);
        boolean alreadyActive = existingSubs.stream().anyMatch(sub -> 
            sub.getPlan() != null && 
            sub.getPlan().getId().equals(planId) && 
            "ACTIVE".equalsIgnoreCase(sub.getStatus())
        );

        if (alreadyActive) {
            log.info("Assinatura do plano {} já está ativa para o usuário {}", plan.getName(), user.getEmail());
            return;
        }

        // Desativar outras assinaturas ativas para o mesmo curso (ou todas se for plano geral)
        existingSubs.stream()
            .filter(sub -> "ACTIVE".equalsIgnoreCase(sub.getStatus()))
            .forEach(sub -> {
                sub.setStatus("CANCELED");
                subscriptionRepository.save(sub);
            });

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

        // Send Email and WhatsApp notifications
        try {
            emailService.sendPaymentSuccessEmail(user.getEmail(), user.getName(), plan.getName(), plan.getPrice() != null ? plan.getPrice().toString() : "0.00");
            
            if (user.getPhone() != null && !user.getPhone().isEmpty()) {
                whatsAppService.sendPaymentSuccess(user.getPhone(), user.getName());
            }
        } catch (Exception e) {
            log.error("Failed to send approval notifications to user {}: {}", user.getEmail(), e.getMessage());
        }
    }

    @Transactional
    public void processInfinitePayEvent(String orderNsu) {
        if (orderNsu == null || orderNsu.isEmpty()) {
            log.error("Recebido evento InfinitePay sem NSU!");
            return;
        }

        log.info("Processando aprovação InfinitePay para NSU: {}", orderNsu);
        com.bizu.portal.commerce.domain.Payment payment = paymentRepository.findByStripeIntentId(orderNsu)
                .orElseThrow(() -> {
                    log.error("Pagamento não encontrado no banco de dados para o NSU: {}", orderNsu);
                    return new RuntimeException("Pagamento não encontrado: " + orderNsu);
                });

        if ("SUCCEEDED".equalsIgnoreCase(payment.getStatus())) {
            log.info("Pagamento {} já estava aprovado.", orderNsu);
            return;
        }

        payment.setStatus("SUCCEEDED");
        paymentRepository.save(payment);

        if (payment.getPlan() != null) {
            activateSubscription(payment.getUser().getId(), payment.getPlan().getId());
        } else {
            log.error("Pagamento {} sem ID de plano vinculado!", orderNsu);
        }
    }

    public java.math.BigDecimal calculateUpgradePrice(Subscription currentSub, Plan newPlan) {
        if (currentSub == null || currentSub.getPlan() == null || currentSub.getPlan().getPrice() == null) {
            return newPlan.getPrice();
        }

        OffsetDateTime now = OffsetDateTime.now();
        if (now.isAfter(currentSub.getCurrentPeriodEnd())) {
            return newPlan.getPrice();
        }

        long totalSeconds = java.time.Duration.between(currentSub.getCurrentPeriodStart(), currentSub.getCurrentPeriodEnd()).getSeconds();
        long remainingSeconds = java.time.Duration.between(now, currentSub.getCurrentPeriodEnd()).getSeconds();

        if (totalSeconds <= 0) return newPlan.getPrice();

        BigDecimal currentPrice = currentSub.getPlan().getPrice();
        
        // Se o plano atual for mais caro (downgrade), retornamos zero (ou valor mínimo) para a troca
        // Mas o usuário pediu "diferenças de preço quando for aumentar", então focamos no upgrade.
        BigDecimal credit = currentPrice.multiply(new BigDecimal(remainingSeconds))
                .divide(new BigDecimal(totalSeconds), 2, java.math.RoundingMode.HALF_UP);

        BigDecimal diff = newPlan.getPrice().subtract(credit);
        
        // Valor mínimo de 1 real para processar gateway
        return diff.max(new BigDecimal("1.00"));
    }

    @Transactional
    public java.util.Map<String, Object> initiateUpgrade(User user, UUID newPlanId, String providerName) {
        Subscription currentSub = subscriptionRepository.findFirstByUserIdAndStatusInOrderByCreatedAtDesc(user.getId(), 
                java.util.List.of("ACTIVE", "PAST_DUE", "active", "PAID"))
                .orElseThrow(() -> new RuntimeException("Nenhuma assinatura ativa para upgrade"));

        Plan newPlan = planRepository.findById(newPlanId).orElseThrow();
        BigDecimal upgradePrice = calculateUpgradePrice(currentSub, newPlan);

        log.info("Iniciando Upgrade para usuário {}: {} -> {} (Preço: R$ {})", 
                user.getEmail(), currentSub.getPlan().getName(), newPlan.getName(), upgradePrice);

        return initiatePayment(user, upgradePrice, providerName, "CREDIT_CARD", newPlanId);
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
