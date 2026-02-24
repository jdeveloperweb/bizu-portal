package com.bizu.portal.student.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "badges", schema = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Badge {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String code; // STREAK_7_DAYS, FIRST_100_QUESTIONS, etc.

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "icon_url")
    private String iconUrl;

    @Builder.Default
    @Column(name = "required_xp")
    private Integer requiredXp = 0;

    @Column(length = 50)
    private String category;

    @Column(name = "xp")
    @Builder.Default
    private Integer xp = 0;

    @Column(name = "target_progress")
    @Builder.Default
    private Integer targetProgress = 0;

    @Column(length = 255)
    private String requirement;

    @Column(length = 100)
    private String color;
}
