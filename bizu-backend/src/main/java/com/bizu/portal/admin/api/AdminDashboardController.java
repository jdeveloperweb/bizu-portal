package com.bizu.portal.admin.api;

import com.bizu.portal.commerce.infrastructure.PaymentRepository;
import com.bizu.portal.identity.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("totalUsers", userRepository.count());
        // stats.put("totalRevenue", paymentRepository.sumSuccessfulPayments()); // Would need custom query
        stats.put("activeSubscriptions", 450); // Mock
        stats.put("newUsersToday", 12); // Mock
        
        return ResponseEntity.ok(stats);
    }
}
