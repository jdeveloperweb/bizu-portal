package com.bizu.portal.content.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "courses", schema = "content")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Course {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "thumbnail_url")
    private String thumbnailUrl;

    @Column(name = "theme_color")
    private String themeColor; // Hex code

    @Column(name = "text_color")
    private String textColor; // Hex code

    @Builder.Default
    @Column(nullable = false)
    private String status = "DRAFT"; // DRAFT, PUBLISHED, ARCHIVED

    @Column(name = "category")
    private String category;

    @Column(name = "level")
    private String level; // INICIANTE, INTERMEDIARIO, AVANCADO

    @Builder.Default
    @Column(name = "is_mandatory")
    private boolean isMandatory = false;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @OneToMany(mappedBy = "course", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonManagedReference
    private List<Module> modules = new ArrayList<>();

    @Builder.Default
    @Column(name = "has_essay")
    private boolean hasEssay = false;

    @Transient
    @Builder.Default
    private long studentsCount = 0;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }

    @com.fasterxml.jackson.annotation.JsonProperty("durationMinutes")
    public int getDurationMinutes() {
        return (modules != null ? modules.stream()
            .mapToInt(Module::getDurationMinutes)
            .sum() : 0);
    }
}
