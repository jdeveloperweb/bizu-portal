package com.bizu.portal.student.domain;

import jakarta.persistence.*;
import lombok.*;
import java.io.Serializable;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "user_quest_claims", schema = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@IdClass(QuestClaim.QuestClaimId.class)
public class QuestClaim {

    @Id
    @Column(name = "user_id")
    private UUID userId;

    @Id
    @Column(name = "quest_code")
    private String questCode;

    @Id
    @Column(name = "period_id")
    private String periodId; // YYYY-MM-DD for daily, YYYY-WW for weekly

    @Column(name = "claimed_at")
    @Builder.Default
    private OffsetDateTime claimedAt = OffsetDateTime.now();

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class QuestClaimId implements Serializable {
        private UUID userId;
        private String questCode;
        private String periodId;
    }
}
