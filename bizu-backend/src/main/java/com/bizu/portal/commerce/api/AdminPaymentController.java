package com.bizu.portal.commerce.api;

import com.bizu.portal.commerce.domain.Payment;
import com.bizu.portal.commerce.infrastructure.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import com.bizu.portal.commerce.application.PaymentService;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/payments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPaymentController {

    private final PaymentRepository paymentRepository;
    private final PaymentService paymentService;

    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {
        // Em um sistema real, aqui teria paginação
        return ResponseEntity.ok(paymentRepository.findAll());
    }

    @PostMapping("/test-simulate")
    public ResponseEntity<String> simulateApproval(@RequestBody java.util.Map<String, String> body) {
        String orderNsu = body.get("orderNsu");
        if (orderNsu == null) return ResponseEntity.badRequest().body("orderNsu é obrigatório");
        
        try {
            paymentService.processInfinitePayEvent(orderNsu);
            return ResponseEntity.ok("Simulação enviada com sucesso! Verifique se a assinatura foi ativada.");
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Erro na simulação: " + e.getMessage());
        }
    }

    @DeleteMapping("/pending")
    public ResponseEntity<Void> deleteAllPending() {
        paymentRepository.deleteByStatus("PENDING");
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deletePayment(@PathVariable UUID id) {
        Payment payment = paymentRepository.findById(id).orElseThrow();
        if ("SUCCEEDED".equals(payment.getStatus())) {
            return ResponseEntity.status(403).build();
        }
        paymentRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
