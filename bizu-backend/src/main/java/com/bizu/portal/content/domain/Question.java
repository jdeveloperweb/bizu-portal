package com.bizu.portal.content.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.JdbcTypeCode;
import org.hibernate.type.SqlTypes;

import java.time.OffsetDateTime;
import java.util.Map;
import java.util.UUID;

@Entity
@Table(name = "questions", schema = "content")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Question {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, columnDefinition = "TEXT")
    private String statement; // The actual question text (Markdown supported)

    @JdbcTypeCode(SqlTypes.JSON)
    @Column(columnDefinition = "jsonb")
    private Map<String, Object> options; // Key-Value pair for options (A, B, C, D...)

    @Column(name = "correct_option")
    private String correctOption;

    @Column(columnDefinition = "TEXT")
    private String resolution; // Explanation for the answer

    private String banca;
    private Integer year;
    private String subject; // Disciplina
    private String topic; // Assunto
    private String difficulty; // EASY, MEDIUM, HARD
    
    @Column(name = "question_type")
    private String questionType; // MULTIPLE_CHOICE, TRUE_FALSE

    @Column(name = "category", nullable = false)
    @Builder.Default
    private String category = "SIMULADO"; // SIMULADO, QUIZ

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id")
    private Module module;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @Column(name = "updated_at", nullable = false)
    private OffsetDateTime updatedAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        updatedAt = OffsetDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        updatedAt = OffsetDateTime.now();
    }
}
