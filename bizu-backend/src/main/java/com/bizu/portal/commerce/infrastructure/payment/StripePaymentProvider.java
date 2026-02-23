package com.bizu.portal.commerce.infrastructure.payment;

import com.bizu.portal.commerce.application.PaymentProvider;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
public class StripePaymentProvider implements PaymentProvider {

    @Override
    public String createPaymentIntent(UUID userId, BigDecimal amount, String currency) {
        // Here would be the Stripe SDK call:
        // PaymentIntent intent = PaymentIntent.create(params);
        return "pi_mock_" + UUID.randomUUID();
    }

    @Override
    public boolean verifyPayment(String intentId) {
        return intentId.startsWith("pi_mock_");
    }

    @Override
    public String getProviderName() {
        return "STRIPE";
    }
}
