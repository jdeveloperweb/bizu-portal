package com.bizu.portal.student.domain;

import com.bizu.portal.identity.domain.User;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "duels", schema = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Duel {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "challenger_id", nullable = false)
    private User challenger;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "opponent_id", nullable = false)
    private User opponent;

    @Builder.Default
    @Column(nullable = false)
    private String status = "PENDING"; // PENDING, IN_PROGRESS, COMPLETED, CANCELLED

    @Builder.Default
    @Column(name = "challenger_score")
    private int challengerScore = 0;

    @Builder.Default
    @Column(name = "opponent_score")
    private int opponentScore = 0;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "winner_id")
    private User winner;

    private String subject;
    
    @Builder.Default
    @Column(name = "question_count")
    private int questionCount = 10;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "completed_at")
    private OffsetDateTime completedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
