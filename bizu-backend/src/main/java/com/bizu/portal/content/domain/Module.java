package com.bizu.portal.content.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "modules", schema = "content")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
@com.fasterxml.jackson.annotation.JsonIgnoreProperties({"hibernateLazyInitializer", "handler"})
public class Module {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "order_index")
    private Integer orderIndex;

    @Builder.Default
    @Column(name = "is_free")
    @com.fasterxml.jackson.annotation.JsonProperty("isFree")
    private boolean isFree = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id")
    @com.fasterxml.jackson.annotation.JsonBackReference
    private Course course;

    @com.fasterxml.jackson.annotation.JsonProperty("courseId")
    public UUID getCourseId() {
        return course != null ? course.getId() : null;
    }

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonManagedReference
    private List<Material> materials = new ArrayList<>();

    @OneToMany(mappedBy = "module", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonManagedReference
    private List<Question> questions = new ArrayList<>();

    @Column(columnDefinition = "TEXT")
    private String objectives;

    @com.fasterxml.jackson.annotation.JsonProperty("durationMinutes")
    public int getDurationMinutes() {
        return (materials != null ? materials.stream()
            .mapToInt(m -> m.getDurationMinutes() != null ? m.getDurationMinutes() : 0)
            .sum() : 0);
    }
}
