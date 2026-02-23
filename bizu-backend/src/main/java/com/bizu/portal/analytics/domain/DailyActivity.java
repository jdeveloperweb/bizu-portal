package com.bizu.portal.analytics.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDate;
import java.util.UUID;

@Entity
@Table(name = "daily_activity", schema = "analytics")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DailyActivity {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "user_id", nullable = false)
    private UUID userId;

    @Column(name = "activity_date", nullable = false)
    private LocalDate activityDate;

    @Column(name = "action_type")
    private String actionType; // LOGIN, STUDY_SESSION, DUEL
}
