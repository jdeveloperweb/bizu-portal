package com.bizu.portal.student.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "gamification_stats", schema = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GamificationStats {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Builder.Default
    @Column(name = "total_xp")
    private Integer totalXp = 0;

    @Builder.Default
    @Column(name = "current_streak")
    private Integer currentStreak = 0;

    @Builder.Default
    @Column(name = "max_streak")
    private Integer max_streak = 0;

    @Column(name = "last_activity_at")
    private OffsetDateTime lastActivityAt;
}
