package com.bizu.portal.commerce.api;

import com.bizu.portal.commerce.domain.Subscription;
import com.bizu.portal.commerce.infrastructure.SubscriptionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.data.domain.Sort;
import java.util.Map;
import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/subscriptions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSubscriptionController {

    private final SubscriptionRepository subscriptionRepository;

    @GetMapping
    public ResponseEntity<Page<Subscription>> getAllSubscriptions(
            @RequestParam(required = false) String search,
            @RequestParam(required = false) String status,
            @PageableDefault(size = 10, sort = "createdAt", direction = Sort.Direction.DESC) Pageable pageable) {
        if (search != null && !search.isBlank()) {
            return ResponseEntity.ok(subscriptionRepository.searchAll(search, status, pageable));
        }
        return ResponseEntity.ok(subscriptionRepository.findAllWithFilters(status, pageable));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Long>> getStats() {
        return ResponseEntity.ok(Map.of(
            "active", subscriptionRepository.countByStatus("ACTIVE"),
            "canceled", subscriptionRepository.countByStatus("CANCELED")
        ));
    }

    @DeleteMapping("/status/{status}")
    public ResponseEntity<Void> deleteByStatus(@PathVariable String status) {
        if (!"CANCELED".equalsIgnoreCase(status)) {
            throw new IllegalArgumentException("Só é permitido deletar em massa assinaturas canceladas");
        }
        subscriptionRepository.deleteAllByStatus("CANCELED");
        return ResponseEntity.noContent().build();
    }

    @PatchMapping("/{id}/status")
    public ResponseEntity<Subscription> updateStatus(@PathVariable UUID id, @RequestBody java.util.Map<String, String> body) {
        Subscription sub = subscriptionRepository.findById(id).orElseThrow();
        sub.setStatus(body.get("status"));
        return ResponseEntity.ok(subscriptionRepository.save(sub));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSubscription(@PathVariable UUID id) {
        subscriptionRepository.deleteById(id);
        return ResponseEntity.noContent().build();
    }
}
