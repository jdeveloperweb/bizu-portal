package com.bizu.portal.commerce.infrastructure;

import com.bizu.portal.admin.domain.SystemSettings;
import com.bizu.portal.commerce.application.PaymentProvider;
import com.bizu.portal.commerce.domain.Plan;
import com.bizu.portal.identity.domain.User;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Component
@Slf4j
public class InfinitePayPaymentProvider implements PaymentProvider {

    private final RestTemplate restTemplate = new RestTemplate();
    private static final String BASE_URL = "https://api.infinitepay.io/invoices/public/checkout/links";
    private static final String CHECK_URL = "https://api.infinitepay.io/invoices/public/checkout/payment_check";

    @Override
    public Map<String, Object> createPayment(User user, BigDecimal amount, String method, Plan plan, SystemSettings settings) {
        String handle = settings.getInfinitePayHandle();
        if (handle == null || handle.isEmpty()) {
            // Fallback para o handle fixo se não estiver configurado
            handle = "mjolnix-tech";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        Map<String, Object> item = new HashMap<>();
        item.put("quantity", 1);
        item.put("price", amount.multiply(new BigDecimal(100)).intValue()); // Em centavos
        item.put("name", "Plano " + plan.getName());

        Map<String, Object> payload = new HashMap<>();
        payload.put("handle", handle);
        payload.put("items", List.of(item));
        payload.put("order_nsu", UUID.randomUUID().toString()); // ID único para controle
        payload.put("redirect_url", "https://bizu.mjolnix.com.br/dashboard?status=success");
        payload.put("webhook_url", "https://bizu.mjolnix.com.br/api/v1/public/webhooks/infinitepay");

        // Metadados extras se a API aceitar ou para controle interno via link
        // A InfinitePay parece ser bem simples nesse POST público, 
        // mas o order_nsu será nosso link com o sistema.

        try {
            HttpEntity<Map<String, Object>> entity = new HttpEntity<>(payload, headers);
            Map<String, Object> response = restTemplate.postForObject(BASE_URL, entity, Map.class);

            if (response != null && response.containsKey("url")) {
                Map<String, Object> result = new HashMap<>();
                result.put("id", payload.get("order_nsu")); // Usamos o NSU como referência
                result.put("url", response.get("url"));
                result.put("type", "REDIRECT");
                return result;
            } else {
                throw new RuntimeException("Resposta inválida da InfinitePay");
            }
        } catch (Exception e) {
            log.error("Erro ao criar link InfinitePay", e);
            throw new RuntimeException("Erro ao processar InfinitePay: " + e.getMessage());
        }
    }

    @Override
    public boolean verifyPayment(String paymentId, SystemSettings settings) {
        // A InfinitePay requer mais dados para o check manual (slug, transaction_nsu)
        // Geralmente confiamos no Webhook por ser o fluxo recomendado.
        // Implementamos um check básico se possível ou retornamos false para forçar webhook.
        return false;
    }

    @Override
    public String getProviderName() {
        return "INFINITEPAY";
    }
}
