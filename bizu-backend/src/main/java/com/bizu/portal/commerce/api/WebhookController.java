package com.bizu.portal.commerce.api;

import com.bizu.portal.commerce.application.PaymentService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/public/webhooks")
@RequiredArgsConstructor
@Slf4j
public class WebhookController {

    private final PaymentService paymentService;

    @PostMapping("/stripe")
    public ResponseEntity<String> handleStripeWebhook(
            @RequestBody String payload,
            @RequestHeader("Stripe-Signature") String sigHeader) {
        
        log.info("Recebido webhook do Stripe");
        
        try {
            paymentService.processStripeEvent(payload, sigHeader);
            return ResponseEntity.ok("Evento processado");
        } catch (Exception e) {
            log.error("Erro ao processar webhook do Stripe: {}", e.getMessage());
            return ResponseEntity.status(400).body("Erro na assinatura ou processamento");
        }
    }

    @PostMapping("/mercadopago")
    public ResponseEntity<String> handleMercadoPagoWebhook(
            @RequestParam(value = "id", required = false) String id,
            @RequestParam(value = "topic", required = false) String topic,
            @RequestBody(required = false) java.util.Map<String, Object> payload) {
        
        log.info("Recebido webhook do Mercado Pago. Topic: {}, ID: {}", topic, id);
        
        if ("payment".equals(topic) && id != null) {
            paymentService.processMercadoPagoEvent(id);
        } else if (payload != null && "payment".equals(payload.get("type"))) {
            // Alguns webhooks do MP vem no body como "data.id"
            java.util.Map<String, Object> data = (java.util.Map<String, Object>) payload.get("data");
            if (data != null && data.get("id") != null) {
                paymentService.processMercadoPagoEvent(data.get("id").toString());
            }
        }
        
        return ResponseEntity.ok("Recebido");
    }

    @PostMapping("/infinitepay")
    public ResponseEntity<String> handleInfinitePayWebhook(@RequestBody java.util.Map<String, Object> payload) {
        log.info("Recebido webhook da InfinitePay: {}", payload);
        
        try {
            if (payload != null && payload.get("status") != null) {
                String status = String.valueOf(payload.get("status"));
                if ("APPROVED".equalsIgnoreCase(status) || "PAID".equalsIgnoreCase(status)) {
                    Object nsuObj = payload.get("order_nsu");
                    if (nsuObj != null) {
                        String orderNsu = String.valueOf(nsuObj);
                        paymentService.processInfinitePayEvent(orderNsu);
                        return ResponseEntity.ok("Processado");
                    }
                }
            }
            return ResponseEntity.ok("Recebido, mas sem ação (status não aprovado ou sem NSU)");
        } catch (Exception e) {
            log.error("Erro crítico ao processar webhook InfinitePay: {}", e.getMessage(), e);
            return ResponseEntity.status(500).body("Erro interno");
        }
    }

    @PostMapping("/pagarme")
    public ResponseEntity<String> handlePagarmeWebhook(@RequestBody String payload) {
        log.info("Recebido webhook do Pagar.me");
        return ResponseEntity.ok("Recebido");
    }
}
