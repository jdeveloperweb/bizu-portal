package com.bizu.portal.identity.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "devices", schema = "identity")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Device {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(name = "device_fingerprint", nullable = false)
    private String deviceFingerprint;

    @Column(name = "os_info")
    private String osInfo;

    @Column(name = "browser_info")
    private String browserInfo;

    @Column(name = "last_ip")
    private String lastIp;

    @Builder.Default
    @Column(name = "is_trusted")
    private boolean isTrusted = false;

    @Column(name = "created_at", nullable = false)
    private OffsetDateTime createdAt;

    @Column(name = "last_seen_at", nullable = false)
    private OffsetDateTime lastSeenAt;

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
        lastSeenAt = OffsetDateTime.now();
    }
}
