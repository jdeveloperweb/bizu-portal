package com.bizu.portal.shared.event;

import com.bizu.portal.student.application.RedisRankingService;
import com.bizu.portal.student.application.StudentAttemptCompletedEvent;
import com.bizu.portal.student.domain.ActivityAttempt;
import com.bizu.portal.student.domain.ActivityType;
import com.bizu.portal.student.infrastructure.GamificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Component;

/**
 * Async event listener for StudentAttemptCompletedEvent.
 * Decouples analytics/ranking/gamification from the request path.
 * NEVER calculate analytics in synchronous request.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class AttemptCompletedEventListener {

    private final RedisRankingService redisRankingService;
    private final GamificationRepository gamificationRepository;

    @Async
    @EventListener
    public void handleAttemptCompleted(StudentAttemptCompletedEvent event) {
        ActivityAttempt attempt = event.getAttempt();

        try {
            // 1. Update Redis ranking (for OfficialExam)
            if (attempt.getActivityType() == ActivityType.OFFICIAL_EXAM
                && attempt.getWeeklyCycleKey() != null) {
                redisRankingService.updateRanking(attempt);
                log.debug("Updated ranking for attempt {}", attempt.getId());
            }

            // 2. Award XP
            gamificationRepository.findById(attempt.getUser().getId()).ifPresent(stats -> {
                stats.setTotalXp(stats.getTotalXp() + attempt.getXpEarned());
                stats.setLastActivityAt(java.time.OffsetDateTime.now());
                gamificationRepository.save(stats);
            });

            // 3. Log for analytics aggregation
            log.info("AttemptCompleted: user={}, course={}, type={}, score={}%, xp={}",
                attempt.getUser().getId(),
                attempt.getCourse().getId(),
                attempt.getActivityType(),
                attempt.getScorePercent(),
                attempt.getXpEarned()
            );
        } catch (Exception e) {
            log.error("Error processing attempt completed event for attempt {}: {}",
                attempt.getId(), e.getMessage(), e);
        }
    }
}
