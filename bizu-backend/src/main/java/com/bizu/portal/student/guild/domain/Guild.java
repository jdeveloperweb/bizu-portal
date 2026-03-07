package com.bizu.portal.student.guild.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "guilds", schema = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Guild {

    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String name;

    @Column(nullable = false)
    private String description;

    @Column(nullable = false)
    private String badge;

    @Column(name = "is_public", nullable = false)
    private boolean isPublic;

    @Column(name = "max_members", nullable = false)
    private int maxMembers;

    @Column(name = "total_xp", nullable = false)
    @Builder.Default
    private long totalXp = 0;

    @Column(name = "weekly_xp", nullable = false)
    @Builder.Default
    private long weeklyXp = 0;

    @Column(name = "streak", nullable = false)
    @Builder.Default
    private int streak = 0;

    @Column(name = "weekly_goal", nullable = false)
    @Builder.Default
    private long weeklyGoal = 10000;

    @Column(nullable = false)
    @Builder.Default
    private String league = "BRONZE";

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID();
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
