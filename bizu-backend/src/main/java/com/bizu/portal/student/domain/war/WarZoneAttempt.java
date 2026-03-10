package com.bizu.portal.student.domain.war;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "war_zone_attempts", schema = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class WarZoneAttempt {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_progress_id", nullable = false)
    private WarZoneProgress zoneProgress;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "question_id", nullable = false)
    private UUID questionId;

    @Column(name = "selected_answer", nullable = false)
    private String selectedAnswer;

    @Builder.Default
    @Column(nullable = false)
    private boolean correct = false;

    @Builder.Default
    @Column(name = "points_earned", nullable = false)
    private int pointsEarned = 0;

    @Column(name = "answered_at", nullable = false)
    private OffsetDateTime answeredAt;

    @PrePersist
    protected void onCreate() {
        if (answeredAt == null) answeredAt = OffsetDateTime.now();
    }
}
