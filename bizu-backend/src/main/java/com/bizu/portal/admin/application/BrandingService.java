package com.bizu.portal.admin.application;

import com.bizu.portal.admin.domain.Branding;
import com.bizu.portal.admin.infrastructure.BrandingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
public class BrandingService {

    private final BrandingRepository brandingRepository;

    @Transactional(readOnly = true)
    public Branding getActiveBranding() {
        return brandingRepository.findFirstByActiveTrue()
                .orElse(Branding.builder()
                        .siteName("Bizu! Portal")
                        .primaryColor("#3b82f6") // Default blue
                        .fontFamily("Plus Jakarta Sans")
                        .active(true)
                        .build());
    }

    @Transactional
    public Branding updateBranding(Branding branding) {
        brandingRepository.findAll().forEach(b -> b.setActive(false));
        branding.setActive(true);
        return brandingRepository.save(branding);
    }
}
