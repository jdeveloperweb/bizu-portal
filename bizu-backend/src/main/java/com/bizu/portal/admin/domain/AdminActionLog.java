package com.bizu.portal.admin.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "admin_action_logs", schema = "admin")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AdminActionLog {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "admin_id", nullable = false)
    private UUID adminId;

    @Column(nullable = false)
    private String action; // CREATE_COURSE, DELETE_USER, etc.

    @Column(name = "resource_type")
    private String resourceType;

    @Column(name = "resource_id")
    private String resourceId;

    @Column(columnDefinition = "TEXT")
    private String details;

    @Column(name = "ip_address")
    private String ipAddress;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
