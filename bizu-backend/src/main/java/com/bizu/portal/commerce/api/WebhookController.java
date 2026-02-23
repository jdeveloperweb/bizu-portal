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

    @PostMapping("/pagarme")
    public ResponseEntity<String> handlePagarmeWebhook(@RequestBody String payload) {
        log.info("Recebido webhook do Pagar.me");
        // Implementação similar para Pagar.me
        return ResponseEntity.ok("Recebido");
    }
}
