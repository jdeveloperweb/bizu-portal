package com.bizu.portal.admin.domain;

import jakarta.persistence.*;
import lombok.*;

import java.util.UUID;

@Entity
@Table(name = "branding", schema = "admin")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Branding {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "site_name")
    private String siteName;

    @Column(name = "logo_url")
    private String logoUrl;

    @Column(name = "primary_color")
    private String primaryColor; // Hex code

    @Column(name = "secondary_color")
    private String secondaryColor; // Hex code

    @Column(name = "favicon_url")
    private String faviconUrl;

    @Column(name = "active", nullable = false)
    private boolean active = true;
}
