package com.bizu.portal.identity.domain;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "verification_codes", schema = "identity")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class VerificationCode {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    private UUID id;

    @Column(nullable = false)
    private String recipient; // can be email or phone number

    @Column(nullable = false, length = 10)
    private String code;

    @Column(nullable = false, length = 50)
    private String type; // "EMAIL" or "WHATSAPP"

    @Column(nullable = false)
    private LocalDateTime expiresAt;

    @Column(nullable = false)
    @Builder.Default
    private boolean used = false;

    @CreationTimestamp
    @Column(updatable = false)
    private LocalDateTime createdAt;
    
    public boolean isValid() {
        return !used && LocalDateTime.now().isBefore(expiresAt);
    }
}
