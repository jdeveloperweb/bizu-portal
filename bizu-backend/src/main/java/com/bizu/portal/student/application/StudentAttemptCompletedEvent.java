package com.bizu.portal.student.application;

import com.bizu.portal.student.domain.ActivityAttempt;
import lombok.Getter;

/**
 * Domain event published when a student completes any activity attempt.
 * Consumed asynchronously by analytics, ranking, and gamification workers.
 */
@Getter
public class StudentAttemptCompletedEvent {

    private final ActivityAttempt attempt;

    public StudentAttemptCompletedEvent(ActivityAttempt attempt) {
        this.attempt = attempt;
    }
}
