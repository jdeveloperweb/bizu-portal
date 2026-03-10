package com.bizu.portal.student.domain.war;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "war_zone_progress", schema = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class WarZoneProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guild_war_session_id", nullable = false)
    private GuildWarSession guildWarSession;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "zone_template_id", nullable = false)
    private WarZoneTemplate zoneTemplate;

    @Builder.Default
    @Column(nullable = false)
    private String status = "LOCKED"; // LOCKED, AVAILABLE, IN_PROGRESS, CONQUERED

    @Builder.Default
    @Column(name = "questions_answered", nullable = false)
    private int questionsAnswered = 0;

    @Builder.Default
    @Column(name = "correct_answers", nullable = false)
    private int correctAnswers = 0;

    @Builder.Default
    @Column(name = "total_points", nullable = false)
    private long totalPoints = 0;

    @Column(name = "conquered_at")
    private OffsetDateTime conqueredAt;
}
