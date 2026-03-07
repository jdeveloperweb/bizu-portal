package com.bizu.portal.student.guild.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "guild_missions", schema = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuildMission {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guild_id", nullable = false)
    private Guild guild;

    @Column(nullable = false)
    private String title;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String type; // DAILY, WEEKLY, MONTHLY

    @Column(nullable = false)
    private int target;

    @Column(nullable = false)
    @Builder.Default
    private int progress = 0;

    @Column(name = "xp_reward", nullable = false)
    private int xpReward;

    @Column(name = "ends_at")
    private OffsetDateTime endsAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean completed = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID();
        createdAt = OffsetDateTime.now();
    }
}
