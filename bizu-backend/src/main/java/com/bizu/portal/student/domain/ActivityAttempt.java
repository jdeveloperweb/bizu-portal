package com.bizu.portal.student.domain;

import com.bizu.portal.content.domain.Course;
import com.bizu.portal.content.domain.Module;
import com.bizu.portal.content.domain.Simulado;
import com.bizu.portal.identity.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

/**
 * Unified Activity engine. Represents a single attempt at any activity type.
 * ActivityAttempt is the main tracking entity for all student activities.
 *
 * OfficialExam: timer global, ranking, snapshot obrigatório
 * ModuleQuiz: vinculado ao módulo, progress-driven
 */
@Entity
@Table(name = "activity_attempts", schema = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Enumerated(EnumType.STRING)
    @Column(name = "activity_type", nullable = false)
    private ActivityType activityType;

    // For OFFICIAL_EXAM: links to the Simulado
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "simulado_id")
    private Simulado simulado;

    // For MODULE_QUIZ: links to the Module
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id")
    private Module module;

    @Column(nullable = false)
    private String status; // STARTED, IN_PROGRESS, COMPLETED, EXPIRED, ABANDONED

    @Column(name = "started_at", nullable = false)
    private OffsetDateTime startedAt;

    @Column(name = "finished_at")
    private OffsetDateTime finishedAt;

    @Column(name = "time_limit_seconds")
    private Integer timeLimitSeconds;

    @Column(name = "total_questions")
    private int totalQuestions;

    @Column(name = "correct_answers")
    @Builder.Default
    private int correctAnswers = 0;

    @Column(name = "score_percent")
    @Builder.Default
    private double scorePercent = 0.0;

    @Column(name = "score_points")
    @Builder.Default
    private int scorePoints = 0;

    @Column(name = "xp_earned")
    @Builder.Default
    private int xpEarned = 0;

    @Column(name = "weekly_cycle_key")
    private String weeklyCycleKey; // e.g., "examId:2026-W09" for ranking

    @OneToMany(mappedBy = "attempt", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @OrderBy("questionOrder ASC")
    private List<ActivityAttemptItemSnapshot> snapshots = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        if (startedAt == null) startedAt = OffsetDateTime.now();
    }

    public boolean isTimedOut() {
        if (timeLimitSeconds == null) return false;
        return OffsetDateTime.now().isAfter(startedAt.plusSeconds(timeLimitSeconds));
    }

    public void complete() {
        this.status = "COMPLETED";
        this.finishedAt = OffsetDateTime.now();
        recalculateScore();
    }

    public void recalculateScore() {
        if (totalQuestions > 0) {
            this.correctAnswers = (int) snapshots.stream()
                .filter(s -> Boolean.TRUE.equals(s.getStudentCorrect()))
                .count();
            this.scorePercent = (double) correctAnswers / totalQuestions * 100;
        }
    }
}
