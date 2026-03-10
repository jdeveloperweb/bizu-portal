package com.bizu.portal.student.domain.war;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "war_day_rankings", schema = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class WarDayRanking {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "war_day_event_id", nullable = false)
    private UUID warDayEventId;

    @Column(name = "guild_id", nullable = false)
    private UUID guildId;

    @Column(name = "guild_name", nullable = false)
    private String guildName;

    @Column(name = "guild_badge")
    private String guildBadge;

    @Builder.Default
    @Column(name = "final_score", nullable = false)
    private long finalScore = 0;

    @Builder.Default
    @Column(name = "zones_conquered", nullable = false)
    private int zonesConquered = 0;

    @Builder.Default
    @Column(name = "correct_answers_total", nullable = false)
    private int correctAnswersTotal = 0;

    @Builder.Default
    @Column(name = "final_position", nullable = false)
    private int finalPosition = 0;

    @Builder.Default
    @Column(name = "xp_distributed", nullable = false)
    private int xpDistributed = 0;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
