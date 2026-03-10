package com.bizu.portal.student.domain.war;

import com.bizu.portal.student.guild.domain.Guild;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "guild_war_sessions", schema = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class GuildWarSession {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "war_day_event_id", nullable = false)
    private WarDayEvent warDayEvent;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guild_id", nullable = false)
    @JsonIgnoreProperties({"members", "hibernateLazyInitializer", "handler"})
    private Guild guild;

    @Builder.Default
    @Column(name = "total_score", nullable = false)
    private long totalScore = 0;

    @Builder.Default
    @Column(name = "zones_conquered", nullable = false)
    private int zonesConquered = 0;

    @Builder.Default
    @Column(nullable = false)
    private String status = "ACTIVE"; // ACTIVE, FINISHED

    @Column(name = "started_at", nullable = false)
    private OffsetDateTime startedAt;

    @Column(name = "finished_at")
    private OffsetDateTime finishedAt;

    @PrePersist
    protected void onCreate() {
        if (startedAt == null) startedAt = OffsetDateTime.now();
    }
}
