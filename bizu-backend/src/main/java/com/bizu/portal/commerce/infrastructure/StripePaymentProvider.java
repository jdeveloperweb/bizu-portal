package com.bizu.portal.commerce.infrastructure;

import com.bizu.portal.commerce.application.PaymentProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
@Slf4j
public class StripePaymentProvider implements PaymentProvider {

    @Value("${stripe.api.key:mock_key}")
    private String apiKey;

    @Override
    public String createPaymentIntent(UUID userId, BigDecimal amount, String currency) {
        log.info("Iniciando transação no Stripe para o usuário {} no valor de {} {}", userId, amount, currency);
        // Simulação de chamada ao Stripe SDK:
        // PaymentIntentCreateParams params = PaymentIntentCreateParams.builder()
        //     .setAmount(amount.multiply(new BigDecimal(100)).longValue())
        //     .setCurrency(currency)
        //     .build();
        // PaymentIntent intent = PaymentIntent.create(params);
        // return intent.getId();
        
        return "pi_stripe_" + UUID.randomUUID().toString().substring(0, 8);
    }

    @Override
    public boolean verifyPayment(String intentId) {
        log.info("Verificando status do pagamento {} no Stripe", intentId);
        return true; // Simulado
    }

    @Override
    public String getProviderName() {
        return "STRIPE";
    }
}
