package com.bizu.portal.student.domain;

import com.bizu.portal.identity.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "simulado_results", schema = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SimuladoResult {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "simulado_id", nullable = false)
    private com.bizu.portal.content.domain.Simulado simulado;

    @Column(nullable = false)
    private int score;

    @Column(name = "total_questions", nullable = false)
    private int totalQuestions;

    @Column(name = "position_in_ranking")
    private Integer positionInRanking;

    @Column(name = "weekly_cycle_date")
    private OffsetDateTime weeklyCycleDate;

    @Column(name = "completed_at", nullable = false)
    private OffsetDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        completedAt = OffsetDateTime.now();
    }
}
