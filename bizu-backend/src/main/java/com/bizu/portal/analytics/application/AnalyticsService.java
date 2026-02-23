package com.bizu.portal.analytics.application;

import com.bizu.portal.analytics.infrastructure.DailyActivityRepository;
import com.bizu.portal.analytics.domain.DailyActivity;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final DailyActivityRepository activityRepository;

    @Transactional
    public void trackActivity(UUID userId, String type) {
        LocalDate today = LocalDate.now();
        if (!activityRepository.existsByUserIdAndActivityDate(userId, today)) {
            activityRepository.save(DailyActivity.builder()
                .userId(userId)
                .activityDate(today)
                .actionType(type)
                .build());
        }
    }

    @Transactional(readOnly = true)
    public Map<String, Long> getEngagementMetrics() {
        LocalDate today = LocalDate.now();
        LocalDate startOfMonth = today.withDayOfMonth(1);

        Map<String, Long> metrics = new HashMap<>();
        metrics.put("DAU", activityRepository.countDistinctUserByActivityDate(today));
        metrics.put("MAU", activityRepository.countDistinctUserByActivityDateBetween(startOfMonth, today));
        
        return metrics;
    }
}
