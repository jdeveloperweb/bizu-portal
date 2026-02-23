package com.bizu.portal.admin.api;

import com.bizu.portal.admin.application.BrandingService;
import com.bizu.portal.admin.domain.Branding;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/admin/branding")
@RequiredArgsConstructor
public class BrandingController {

    private final BrandingService brandingService;

    @GetMapping("/active")
    public ResponseEntity<Branding> getActive() {
        return ResponseEntity.ok(brandingService.getActiveBranding());
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<Branding> update(@RequestBody Branding branding) {
        return ResponseEntity.ok(brandingService.updateBranding(branding));
    }
}
