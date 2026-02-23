package com.bizu.portal.content.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "simulados", schema = "content")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Simulado {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "start_date")
    private OffsetDateTime startDate;

    @Column(name = "end_date")
    private OffsetDateTime endDate;

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "weekly_cycle")
    private boolean weeklyCycle = false;

    @ManyToMany
    @JoinTable(
        name = "simulado_questions",
        schema = "content",
        joinColumns = @JoinColumn(name = "simulado_id"),
        inverseJoinColumns = @JoinColumn(name = "question_id")
    )
    @Builder.Default
    private List<Question> questions = new ArrayList<>();

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
