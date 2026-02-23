package com.bizu.portal.commerce.infrastructure;

import com.bizu.portal.commerce.application.PaymentProvider;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.UUID;

@Component
@Slf4j
public class PagarMePaymentProvider implements PaymentProvider {

    @Value("${pagarme.api.key:mock_key}")
    private String apiKey;

    @Override
    public String createPaymentIntent(UUID userId, BigDecimal amount, String currency) {
        log.info("Iniciando transação no Pagar.me para o usuário {} no valor de {} {}", userId, amount, currency);
        // Simulação de criação de pedido/transação para Pix ou Boleto
        return "ord_pagarme_" + UUID.randomUUID().toString().substring(0, 8);
    }

    @Override
    public boolean verifyPayment(String intentId) {
        log.info("Verificando status do pagamento {} no Pagar.me", intentId);
        return true; // Simulado
    }

    @Override
    public String getProviderName() {
        return "PAGARME";
    }
}
