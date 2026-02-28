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
public class GamificationStats implements org.springframework.data.domain.Persistable<UUID> {

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
    private Integer maxStreak = 0;

    @Builder.Default
    @Column(name = "axon_coins")
    private Integer axonCoins = 0;

    @Column(name = "last_activity_at")
    private OffsetDateTime lastActivityAt;

    @Column(name = "xp_boost_until")
    private OffsetDateTime xpBoostUntil;

    @Column(name = "radar_materia_until")
    private OffsetDateTime radarMateriaUntil;

    @Column(name = "radar_materia_code")
    private String radarMateriaCode;

    @Column(name = "active_title")
    private String activeTitle;

    @Transient
    private boolean isNew = true;

    @Override
    public UUID getId() {
        return userId;
    }

    @Override
    public boolean isNew() {
        return isNew;
    }

    @PostLoad
    @PostPersist
    void markNotNew() {
        this.isNew = false;
    }
}
