package com.bizu.portal.commerce.domain;

import com.bizu.portal.content.domain.Course;
import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.util.UUID;

@Entity
@Table(name = "plans", schema = "commerce")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Plan {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String name;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(nullable = false)
    private BigDecimal price;

    @Column(nullable = false)
    private String currency = "BRL";

    @Column(name = "billing_interval")
    private String billingInterval; // MONTHLY, YEARLY, ONE_TIME

    @Column(nullable = false)
    private boolean active = true;

    @Column(name = "stripe_price_id")
    private String stripePriceId;

    @Column(name = "is_group")
    private boolean group = false;

    @Column(name = "max_members")
    private int maxMembers = 1;

    @Column(name = "devices_per_user")
    private int devicesPerUser = 3;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "course_id")
    private Course course;

    @Column(columnDefinition = "TEXT")
    private String features; // JSON array string: ["feat1","feat2"]

    @Column
    private boolean highlight = false;

    @Column
    private String badge;

    @Column(name = "sort_order")
    private int sortOrder = 0;
}
