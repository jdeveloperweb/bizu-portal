package com.bizu.portal.commerce.domain;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "coupons", schema = "commerce")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Coupon {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false, unique = true)
    private String code;

    @Column(nullable = false)
    private String type; // PERCENTAGE, FIXED_AMOUNT

    @Column(nullable = false)
    private BigDecimal value;

    @Column(name = "max_uses")
    private Integer maxUses;

    @Builder.Default
    @Column(name = "used_count")
    private int usedCount = 0;

    @Column(name = "valid_from")
    private OffsetDateTime validFrom;

    @Column(name = "valid_until")
    private OffsetDateTime validUntil;

    @Builder.Default
    @Column(nullable = false)
    private boolean active = true;

    public boolean isValid() {
        if (!active) return false;
        if (maxUses != null && usedCount >= maxUses) return false;
        OffsetDateTime now = OffsetDateTime.now();
        if (validFrom != null && now.isBefore(validFrom)) return false;
        if (validUntil != null && now.isAfter(validUntil)) return false;
        return true;
    }
}
