package com.bizu.portal.student.domain;

import com.bizu.portal.content.domain.Simulado;
import com.bizu.portal.identity.domain.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

/**
 * A practice attempt at a simulado. Unlike {@link SimuladoSession}, there is no
 * unique constraint — students can redo as many times as they want.
 * Results are never persisted to the ranking.
 */
@Entity
@Table(name = "simulado_practice_sessions", schema = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimuladoPracticeSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "simulado_id", nullable = false)
    private Simulado simulado;

    @Column(name = "started_at", nullable = false)
    private OffsetDateTime startedAt;

    @Column(name = "expires_at", nullable = false)
    private OffsetDateTime expiresAt;

    @Column(name = "submitted_at")
    private OffsetDateTime submittedAt;

    /** IN_PROGRESS, COMPLETED, CANCELLED, EXPIRED */
    @Builder.Default
    @Column(nullable = false)
    private String status = "IN_PROGRESS";

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb", nullable = false)
    @Builder.Default
    private Map<String, String> answers = new HashMap<>();

    @Column
    private Integer score;

    @Column(name = "total_questions")
    private Integer totalQuestions;

    @PrePersist
    protected void onCreate() {
        if (startedAt == null) startedAt = OffsetDateTime.now();
    }
}
