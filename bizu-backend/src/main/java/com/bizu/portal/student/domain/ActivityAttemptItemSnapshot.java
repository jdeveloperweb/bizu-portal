package com.bizu.portal.student.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

/**
 * Immutable snapshot of a question at the time the student started the activity.
 * Freezes: statement, options, correct answer, weight, order.
 * NEVER recalculate historical scores based on current question versions.
 */
@Entity
@Table(name = "activity_attempt_item_snapshots", schema = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ActivityAttemptItemSnapshot {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "attempt_id", nullable = false)
    private ActivityAttempt attempt;

    // Reference to original question (for analytics, not for recalculation)
    @Column(name = "original_question_id", nullable = false)
    private UUID originalQuestionId;

    @Column(name = "question_order", nullable = false)
    private int questionOrder;

    // --- FROZEN FIELDS (snapshot at attempt start) ---

    @Column(name = "snapshot_statement", nullable = false, columnDefinition = "TEXT")
    private String snapshotStatement;

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(name = "snapshot_options", columnDefinition = "jsonb", nullable = false)
    private Map<String, Object> snapshotOptions;

    @Column(name = "snapshot_correct_option", nullable = false)
    private String snapshotCorrectOption;

    @Column(name = "snapshot_resolution", columnDefinition = "TEXT")
    private String snapshotResolution;

    @Column(name = "snapshot_difficulty")
    private String snapshotDifficulty;

    @Column(name = "snapshot_subject")
    private String snapshotSubject;

    @Column(name = "snapshot_weight")
    @Builder.Default
    private double snapshotWeight = 1.0;

    // --- STUDENT RESPONSE ---

    @Column(name = "student_selected_option")
    private String studentSelectedOption;

    @Column(name = "student_correct")
    private Boolean studentCorrect;

    @Column(name = "time_spent_seconds")
    private Integer timeSpentSeconds;

    @Column(name = "answered_at")
    private OffsetDateTime answeredAt;

    /**
     * Evaluate the student's answer against the frozen correct option.
     */
    public void evaluate() {
        if (studentSelectedOption != null) {
            this.studentCorrect = snapshotCorrectOption.equals(studentSelectedOption);
            this.answeredAt = OffsetDateTime.now();
        }
    }
}
