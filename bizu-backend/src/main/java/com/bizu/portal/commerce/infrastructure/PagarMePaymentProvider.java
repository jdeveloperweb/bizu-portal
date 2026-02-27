package com.bizu.portal.commerce.infrastructure;

import com.bizu.portal.admin.domain.SystemSettings;
import com.bizu.portal.commerce.application.PaymentProvider;
import com.bizu.portal.commerce.domain.Plan;
import com.bizu.portal.identity.domain.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class PagarMePaymentProvider implements PaymentProvider {

    @Override
    public Map<String, Object> createPayment(User user, BigDecimal amount, String method, Plan plan, SystemSettings settings) {
        log.info("Iniciando transação Mock no Pagar.me para o usuário {} no valor de {}", user.getId(), amount);
        
        Map<String, Object> response = new HashMap<>();
        response.put("id", "ord_pagarme_" + java.util.UUID.randomUUID().toString().substring(0, 8));
        response.put("status", "pending");
        response.put("type", "MOCK");
        
        return response;
    }

    @Override
    public boolean verifyPayment(String paymentId, SystemSettings settings) {
        log.info("Verificando status do pagamento {} no Pagar.me", paymentId);
        return true;
    }

    @Override
    public String getProviderName() {
        return "PAGARME";
    }
}
