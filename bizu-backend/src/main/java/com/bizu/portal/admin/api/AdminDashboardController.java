package com.bizu.portal.admin.api;

import com.bizu.portal.commerce.infrastructure.PaymentRepository;
import com.bizu.portal.commerce.infrastructure.SubscriptionRepository;
import com.bizu.portal.identity.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/admin/dashboard")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminDashboardController {

    private final UserRepository userRepository;
    private final PaymentRepository paymentRepository;
    private final SubscriptionRepository subscriptionRepository;

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        Map<String, Object> response = new HashMap<>();
        
        // Stats
        response.put("totalUsers", userRepository.count());
        
        OffsetDateTime todayStart = OffsetDateTime.now().truncatedTo(java.time.temporal.ChronoUnit.DAYS);
        response.put("newUsersToday", userRepository.countByCreatedAtAfter(todayStart));
        
        response.put("activeSubscriptions", subscriptionRepository.countByStatus("ACTIVE"));
        
        OffsetDateTime monthStart = OffsetDateTime.now().withDayOfMonth(1).truncatedTo(java.time.temporal.ChronoUnit.DAYS);
        java.math.BigDecimal revenue = paymentRepository.sumAmountByStatusAndCreatedAtAfter("SUCCEEDED", monthStart);
        response.put("monthlyRevenue", revenue != null ? revenue : java.math.BigDecimal.ZERO);
        
        // Recent Activity
        List<Map<String, Object>> recentActivity = paymentRepository.findTop5ByOrderByCreatedAtDesc().stream()
            .map(payment -> {
                Map<String, Object> activity = new HashMap<>();
                activity.put("userName", payment.getUser().getName());
                activity.put("amount", payment.getAmount());
                activity.put("status", payment.getStatus());
                activity.put("createdAt", payment.getCreatedAt());
                return activity;
            })
            .collect(java.util.stream.Collectors.toList());
            
        response.put("recentActivity", recentActivity);
        
        return ResponseEntity.ok(response);
    }
}
