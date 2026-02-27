package com.bizu.portal.commerce.infrastructure;

import com.bizu.portal.admin.domain.SystemSettings;
import com.bizu.portal.commerce.application.PaymentProvider;
import com.bizu.portal.commerce.domain.Plan;
import com.bizu.portal.identity.domain.User;
import com.stripe.Stripe;
import com.stripe.model.checkout.Session;
import com.stripe.param.checkout.SessionCreateParams;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class StripePaymentProvider implements PaymentProvider {

    @Override
    public Map<String, Object> createPayment(User user, BigDecimal amount, String method, Plan plan, SystemSettings settings) {
        String secretKey = settings.getStripeSecretKey();
        if (secretKey == null || secretKey.isEmpty()) {
            throw new RuntimeException("Stripe Secret Key não configurada.");
        }

        Stripe.apiKey = secretKey;

        try {
            SessionCreateParams.Builder builder = SessionCreateParams.builder()
                    .setMode(SessionCreateParams.Mode.PAYMENT)
                    .setSuccessUrl("https://bizu.mjolnix.com.br/dashboard?status=success&session_id={CHECKOUT_SESSION_ID}")
                    .setCancelUrl("https://bizu.mjolnix.com.br/checkout?status=cancel")
                    .setCustomerEmail(user.getEmail())
                    .addLineItem(SessionCreateParams.LineItem.builder()
                            .setQuantity(1L)
                            .setPriceData(SessionCreateParams.LineItem.PriceData.builder()
                                    .setCurrency("brl")
                                    .setUnitAmount(amount.multiply(new BigDecimal(100)).longValue())
                                    .setProductData(SessionCreateParams.LineItem.PriceData.ProductData.builder()
                                            .setName("Plano " + plan.getName())
                                            .setDescription("Acesso ao curso e materiais do Bizu! Academy")
                                            .build())
                                    .build())
                            .build());

            // Habilitar Pix se o método for PIX ou se quisermos oferecer ambos
            if ("PIX".equalsIgnoreCase(method)) {
                builder.addPaymentMethodType(SessionCreateParams.PaymentMethodType.PIX);
            } else {
                builder.addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD);
            }

            // Metadados para recuperação no webhook
            builder.putMetadata("user_id", user.getId().toString());
            builder.putMetadata("plan_id", plan.getId().toString());

            Session session = Session.create(builder.build());

            Map<String, Object> response = new HashMap<>();
            response.put("id", session.getId());
            response.put("url", session.getUrl());
            response.put("type", "REDIRECT");

            return response;
        } catch (Exception e) {
            log.error("Erro ao criar sessão no Stripe", e);
            throw new RuntimeException("Erro ao processar Stripe: " + e.getMessage());
        }
    }

    @Override
    public boolean verifyPayment(String paymentId, SystemSettings settings) {
        try {
            Stripe.apiKey = settings.getStripeSecretKey();
            Session session = Session.retrieve(paymentId);
            return "paid".equalsIgnoreCase(session.getPaymentStatus());
        } catch (Exception e) {
            log.error("Erro ao verificar sessão Stripe {}", paymentId, e);
            return false;
        }
    }

    @Override
    public String getProviderName() {
        return "STRIPE";
    }
}
