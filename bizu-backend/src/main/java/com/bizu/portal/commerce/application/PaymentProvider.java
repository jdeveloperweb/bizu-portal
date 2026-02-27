package com.bizu.portal.commerce.application;

import com.bizu.portal.admin.domain.SystemSettings;
import com.bizu.portal.commerce.domain.Plan;
import com.bizu.portal.identity.domain.User;
import java.math.BigDecimal;
import java.util.Map;
import java.util.UUID;

public interface PaymentProvider {
    Map<String, Object> createPayment(User user, BigDecimal amount, String method, Plan plan, SystemSettings settings);
    boolean verifyPayment(String paymentId, SystemSettings settings);
    String getProviderName();
}
