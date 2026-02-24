package com.bizu.portal.admin.domain;

import jakarta.persistence.*;
import lombok.*;
import java.time.OffsetDateTime;

@Entity
@Table(name = "system_settings", schema = "admin")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SystemSettings {

    @Id
    @Builder.Default
    private String id = "SINGLETON";

    @Column(name = "stripe_pub_key")
    private String stripePubKey;

    @Column(name = "stripe_secret_key")
    private String stripeSecretKey;

    @Column(name = "stripe_webhook_secret")
    private String stripeWebhookSecret;

    @Column(name = "mp_access_token")
    private String mpAccessToken;

    @Column(name = "mp_public_key")
    private String mpPublicKey;

    @Column(name = "smtp_host")
    private String smtpHost;

    @Column(name = "smtp_port")
    private Integer smtpPort;

    @Column(name = "smtp_encryption")
    private String smtpEncryption;

    @Column(name = "smtp_user")
    private String smtpUser;

    @Column(name = "smtp_pass")
    private String smtpPass;

    @Column(name = "vimeo_client_id")
    private String vimeoClientId;

    @Column(name = "vimeo_secret")
    private String vimeoSecret;

    @Column(name = "vimeo_token")
    private String vimeoToken;

    @Column(name = "timezone")
    private String timezone;

    @Column(name = "session_timeout")
    private Integer sessionTimeout;

    @Column(name = "maintenance_mode")
    private Boolean maintenanceMode;

    @Column(name = "updated_at")
    private OffsetDateTime updatedAt;

    @Column(name = "updated_by")
    private String updatedBy;
}
