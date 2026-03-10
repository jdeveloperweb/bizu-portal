package com.bizu.portal.student.domain.war;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.HashSet;
import java.util.Set;
import java.util.UUID;

@Entity
@Table(name = "war_zone_templates", schema = "student")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class WarZoneTemplate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "map_template_id", nullable = false)
    @JsonIgnoreProperties({"zones", "hibernateLazyInitializer", "handler"})
    private WarMapTemplate mapTemplate;

    @Column(nullable = false)
    private String name;

    @Builder.Default
    @Column(name = "zone_type", nullable = false)
    private String zoneType = "CAMP"; // CAMP, WATCHTOWER, FORTRESS, CASTLE, BOSS

    @Builder.Default
    @Column(name = "difficulty_level", nullable = false)
    private int difficultyLevel = 1;

    @Builder.Default
    @Column(name = "position_x", nullable = false)
    private double positionX = 0.5;

    @Builder.Default
    @Column(name = "position_y", nullable = false)
    private double positionY = 0.5;

    @Builder.Default
    @Column(name = "question_count", nullable = false)
    private int questionCount = 10;

    @Builder.Default
    @Column(name = "points_per_correct", nullable = false)
    private int pointsPerCorrect = 10;

    @Builder.Default
    @Column(name = "terrain_type")
    private String terrainType = "PLAINS";

    @Builder.Default
    @Column(name = "display_order", nullable = false)
    private int displayOrder = 0;

    @Builder.Default
    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(
        name = "war_zone_prerequisites",
        schema = "student",
        joinColumns = @JoinColumn(name = "zone_id")
    )
    @Column(name = "prerequisite_zone_id")
    private Set<UUID> prerequisiteZoneIds = new HashSet<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
