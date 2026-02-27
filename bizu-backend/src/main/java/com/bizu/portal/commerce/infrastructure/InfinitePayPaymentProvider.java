package com.bizu.portal.commerce.infrastructure;

import com.bizu.portal.admin.domain.SystemSettings;
import com.bizu.portal.commerce.application.PaymentProvider;
import com.bizu.portal.commerce.domain.Plan;
import com.bizu.portal.identity.domain.User;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Component;
import org.springframework.web.client.RestTemplate;

import java.math.BigDecimal;
import java.util.*;

@Component
@Slf4j
public class InfinitePayPaymentProvider implements PaymentProvider {

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();
    private static final String BASE_URL = "https://api.infinitepay.io/invoices/public/checkout/links";

    @Override
    public Map<String, Object> createPayment(User user, BigDecimal amount, String method, Plan plan, SystemSettings settings) {
        String handle = settings.getInfinitePayHandle();
        if (handle == null || handle.isEmpty()) {
            handle = "mjolnix-tech";
        }

        try {
            // Itens da compra conforme documentação oficial
            Map<String, Object> item = new LinkedHashMap<>();
            item.put("quantity", 1);
            item.put("price", amount.multiply(new BigDecimal(100)).longValue()); // Em centavos (Long)
            String description = plan.getCourse() != null 
                    ? plan.getCourse().getTitle() + " - " + plan.getName() 
                    : plan.getName();
            item.put("description", description);

            // Objeto de payload sem chaves extras, conforme print da documentação
            Map<String, Object> payload = new LinkedHashMap<>();
            payload.put("handle", handle);
            String orderNsu = "BZ-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
            payload.put("order_nsu", orderNsu); 
            payload.put("items", List.of(item));
            payload.put("redirect_url", "https://bizu.mjolnix.com.br/checkout?status=success&plan=" + plan.getId());
            payload.put("webhook_url", "https://bizu.mjolnix.com.br/api/v1/public/webhooks/infinitepay");

            // Opcional: Dados do cliente
            Map<String, Object> customer = new LinkedHashMap<>();
            customer.put("name", user.getName());
            customer.put("email", user.getEmail());
            payload.put("customer", customer);

            String jsonPayload = objectMapper.writeValueAsString(payload);
            log.info("Enviando Payload para InfinitePay: {}", jsonPayload);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.setAccept(List.of(MediaType.APPLICATION_JSON));

            HttpEntity<String> entity = new HttpEntity<>(jsonPayload, headers);
            
            // Usando Map.class para receber a resposta
            Map<String, Object> response = restTemplate.postForObject(BASE_URL, entity, Map.class);

            if (response != null && response.containsKey("url")) {
                Map<String, Object> result = new HashMap<>();
                result.put("id", payload.get("order_nsu")); // Mantemos o nsu curto para o registro
                result.put("url", response.get("url"));
                result.put("type", "REDIRECT");
                return result;
            } else {
                log.error("Resposta da InfinitePay sem URL: {}", response);
                throw new RuntimeException("Resposta inválida da InfinitePay (URL ausente)");
            }
        } catch (org.springframework.web.client.HttpClientErrorException e) {
            log.error("Erro 400/404 na InfinitePay: {} - Body: {}", e.getMessage(), e.getResponseBodyAsString());
            throw new RuntimeException("InfinitePay recusou a requisição: " + e.getResponseBodyAsString());
        } catch (Exception e) {
            log.error("Erro interno ao processar InfinitePay", e);
            throw new RuntimeException("Erro ao processar InfinitePay: " + e.getMessage());
        }
    }

    @Override
    public boolean verifyPayment(String paymentId, SystemSettings settings) {
        return false;
    }

    @Override
    public String getProviderName() {
        return "INFINITEPAY";
    }
}
