package com.bizu.portal.commerce.api;

import com.bizu.portal.commerce.domain.Payment;
import com.bizu.portal.commerce.infrastructure.PaymentRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/payments")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminPaymentController {

    private final PaymentRepository paymentRepository;

    @GetMapping
    public ResponseEntity<List<Payment>> getAllPayments() {
        // Em um sistema real, aqui teria paginação
        return ResponseEntity.ok(paymentRepository.findAll());
    }
}
