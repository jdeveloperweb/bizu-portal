package com.bizu.portal.content.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "question_import_logs", schema = "content")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class QuestionImportLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "course_id")
    private UUID courseId;

    @Column(name = "course_title")
    private String courseTitle;

    @Column(name = "module_id")
    private UUID moduleId;

    @Column(name = "module_title")
    private String moduleTitle;

    @Column(nullable = false)
    private String category;

    @Column(name = "question_count", nullable = false)
    private int questionCount;

    @Column(name = "file_name")
    private String fileName;

    @Column(name = "original_json", columnDefinition = "TEXT")
    private String originalJson;

    @Column(name = "imported_by")
    private String importedBy;

    @Column(name = "imported_at", nullable = false, updatable = false)
    @Builder.Default
    private OffsetDateTime importedAt = OffsetDateTime.now();
}
