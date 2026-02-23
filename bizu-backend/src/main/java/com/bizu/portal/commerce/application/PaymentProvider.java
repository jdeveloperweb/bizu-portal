package com.bizu.portal.commerce.application;

import java.math.BigDecimal;
import java.util.UUID;

public interface PaymentProvider {
    String createPaymentIntent(UUID userId, BigDecimal amount, String currency);
    boolean verifyPayment(String intentId);
    String getProviderName();
}
