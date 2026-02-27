package com.bizu.portal.admin.api;

import com.bizu.portal.admin.application.SystemSettingsService;
import com.bizu.portal.admin.domain.SystemSettings;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/public/settings")
@RequiredArgsConstructor
public class PublicSettingsController {

    private final SystemSettingsService systemSettingsService;

    @GetMapping
    public ResponseEntity<Map<String, Object>> getPublicSettings() {
        SystemSettings settings = systemSettingsService.getSettings();
        
        Map<String, Object> publicSettings = new HashMap<>();
        publicSettings.put("stripePubKey", settings.getStripePubKey());
        publicSettings.put("mpPublicKey", settings.getMpPublicKey());
        publicSettings.put("preferredPaymentGateway", settings.getPreferredPaymentGateway());
        publicSettings.put("maintenanceMode", settings.getMaintenanceMode());
        publicSettings.put("timezone", settings.getTimezone());
        
        return ResponseEntity.ok(publicSettings);
    }
}
