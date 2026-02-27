package com.bizu.portal.commerce.infrastructure;

import com.bizu.portal.admin.domain.SystemSettings;
import com.bizu.portal.commerce.application.PaymentProvider;
import com.bizu.portal.commerce.domain.Plan;
import com.bizu.portal.identity.domain.User;
import com.mercadopago.MercadoPagoConfig;
import com.mercadopago.client.payment.PaymentClient;
import com.mercadopago.client.payment.PaymentCreateRequest;
import com.mercadopago.client.payment.PaymentPayerRequest;
import com.mercadopago.client.preference.PreferenceBackUrlsRequest;
import com.mercadopago.client.preference.PreferenceClient;
import com.mercadopago.client.preference.PreferenceItemRequest;
import com.mercadopago.client.preference.PreferenceRequest;
import com.mercadopago.resources.payment.Payment;
import com.mercadopago.resources.preference.Preference;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.HashMap;
import java.util.Map;

@Component
@Slf4j
public class MercadoPagoPaymentProvider implements PaymentProvider {

    @Override
    public Map<String, Object> createPayment(User user, BigDecimal amount, String method, Plan plan, SystemSettings settings) {
        String accessToken = settings.getMpAccessToken();
        if (accessToken == null || accessToken.isEmpty()) {
            throw new RuntimeException("Mercado Pago Access Token não configurado.");
        }

        MercadoPagoConfig.setAccessToken(accessToken);

        if ("PIX".equalsIgnoreCase(method)) {
            return createPixPayment(user, amount, plan);
        } else {
            return createPreferencePayment(user, amount, plan);
        }
    }

    private Map<String, Object> createPixPayment(User user, BigDecimal amount, Plan plan) {
        try {
            PaymentClient client = new PaymentClient();

            PaymentCreateRequest request = PaymentCreateRequest.builder()
                    .transactionAmount(amount)
                    .description("Plano " + plan.getName() + " - " + user.getName())
                    .paymentMethodId("pix")
                    .notificationUrl("https://bizu.mjolnix.com.br/api/v1/public/webhooks/mercadopago") // Ajustar via settings se possível
                    .payer(PaymentPayerRequest.builder()
                            .email(user.getEmail())
                            .firstName(user.getName())
                            .build())
                    .metadata(Map.of(
                        "user_id", user.getId().toString(),
                        "plan_id", plan.getId().toString()
                    ))
                    .build();

            Payment payment = client.create(request);

            Map<String, Object> response = new HashMap<>();
            response.put("id", payment.getId().toString());
            response.put("status", payment.getStatus());
            response.put("type", "PIX");
            
            if (payment.getPointOfInteraction() != null && 
                payment.getPointOfInteraction().getTransactionData() != null) {
                response.put("qrCode", payment.getPointOfInteraction().getTransactionData().getQrCode());
                response.put("qrCodeBase64", payment.getPointOfInteraction().getTransactionData().getQrCodeBase64());
            }

            return response;
        } catch (Exception e) {
            log.error("Erro ao criar pagamento Pix no Mercado Pago", e);
            throw new RuntimeException("Erro ao processar Pix: " + e.getMessage());
        }
    }

    private Map<String, Object> createPreferencePayment(User user, BigDecimal amount, Plan plan) {
        try {
            PreferenceClient client = new PreferenceClient();

            PreferenceItemRequest item = PreferenceItemRequest.builder()
                    .title("Plano " + plan.getName())
                    .quantity(1)
                    .unitPrice(amount)
                    .currencyId("BRL")
                    .build();

            PreferenceRequest request = PreferenceRequest.builder()
                    .items(Collections.singletonList(item))
                    .payer(com.mercadopago.client.preference.PreferencePayerRequest.builder()
                            .email(user.getEmail())
                            .build())
                    .notificationUrl("https://bizu.mjolnix.com.br/api/v1/public/webhooks/mercadopago")
                    .backUrls(PreferenceBackUrlsRequest.builder()
                            .success("https://bizu.mjolnix.com.br/dashboard?status=success")
                            .failure("https://bizu.mjolnix.com.br/dashboard?status=failure")
                            .pending("https://bizu.mjolnix.com.br/dashboard?status=pending")
                            .build())
                    .autoReturn("approved")
                    .metadata(Map.of(
                        "user_id", user.getId().toString(),
                        "plan_id", plan.getId().toString()
                    ))
                    .build();

            Preference preference = client.create(request);

            Map<String, Object> response = new HashMap<>();
            response.put("id", preference.getId());
            response.put("url", preference.getInitPoint());
            response.put("type", "REDIRECT");
            
            return response;
        } catch (Exception e) {
            log.error("Erro ao criar preferência no Mercado Pago", e);
            throw new RuntimeException("Erro ao processar Cartão: " + e.getMessage());
        }
    }

    @Override
    public boolean verifyPayment(String paymentId, SystemSettings settings) {
        try {
            MercadoPagoConfig.setAccessToken(settings.getMpAccessToken());
            PaymentClient client = new PaymentClient();
            Payment payment = client.get(Long.parseLong(paymentId));
            return "approved".equalsIgnoreCase(payment.getStatus());
        } catch (Exception e) {
            log.error("Erro ao verificar pagamento {}", paymentId, e);
            return false;
        }
    }

    @Override
    public String getProviderName() {
        return "MERCADO_PAGO";
    }
}
