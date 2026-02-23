package com.bizu.portal.content.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "materials", schema = "content")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Material {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(name = "file_url", nullable = false)
    private String fileUrl; // S3 URL

    @Column(name = "file_type")
    private String fileType; // PDF, VIDEO, DOC

    @Column(name = "is_free")
    private boolean isFree = false;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "module_id")
    private Module module;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
