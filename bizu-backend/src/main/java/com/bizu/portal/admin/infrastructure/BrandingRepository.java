package com.bizu.portal.admin.infrastructure;

import com.bizu.portal.admin.domain.Branding;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface BrandingRepository extends JpaRepository<Branding, UUID> {
    Optional<Branding> findFirstByActiveTrue();
}
