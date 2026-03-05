package com.bizu.portal.student.domain;

import jakarta.persistence.*;
import lombok.*;
import java.util.UUID;

@Entity
@Table(name = "quests", schema = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Quest {
    @Id
    private UUID id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String title;

    private String description;

    @Column(name = "reward_xp", nullable = false)
    private Integer rewardXp;

    @Column(name = "reward_axons", nullable = false)
    private Integer rewardAxons;

    @Column(nullable = false)
    private String type; // DAILY, WEEKLY

    @Column(name = "goal_type", nullable = false)
    private String goalType; // QUESTIONS, STREAK, WIN, ACCURACY

    @Column(name = "goal_value", nullable = false)
    private Integer goalValue;
}
