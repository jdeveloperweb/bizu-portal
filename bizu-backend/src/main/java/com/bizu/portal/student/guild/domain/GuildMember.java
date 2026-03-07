package com.bizu.portal.student.guild.domain;

import com.bizu.portal.identity.domain.User;
import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "guild_members", schema = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class GuildMember {

    @Id
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "guild_id", nullable = false)
    private Guild guild;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private GuildRole role;

    @Column(name = "xp_contribution", nullable = false)
    @Builder.Default
    private long xpContribution = 0;

    @Column(name = "streak", nullable = false)
    @Builder.Default
    private int streak = 0;

    @Column(name = "joined_at", nullable = false, updatable = false)
    private OffsetDateTime joinedAt;

    @PrePersist
    protected void onCreate() {
        if (id == null) id = UUID.randomUUID();
        joinedAt = OffsetDateTime.now();
    }

    public enum GuildRole {
        FOUNDER, ADMIN, MEMBER
    }
}
