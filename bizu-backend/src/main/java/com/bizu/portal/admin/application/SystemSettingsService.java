package com.bizu.portal.admin.application;

import com.bizu.portal.admin.domain.SystemSettings;
import com.bizu.portal.admin.infrastructure.SystemSettingsRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;

@Service
@RequiredArgsConstructor
public class SystemSettingsService {

    private final SystemSettingsRepository systemSettingsRepository;

    @Transactional(readOnly = true)
    public SystemSettings getSettings() {
        return systemSettingsRepository.findById("SINGLETON")
            .orElseGet(() -> {
                SystemSettings settings = new SystemSettings();
                settings.setId("SINGLETON");
                return systemSettingsRepository.save(settings);
            });
    }

    @Transactional
    public SystemSettings updateSettings(SystemSettings updatedSettings, String username) {
        SystemSettings settings = getSettings();
        
        settings.setStripePubKey(updatedSettings.getStripePubKey());
        settings.setStripeSecretKey(updatedSettings.getStripeSecretKey());
        settings.setStripeWebhookSecret(updatedSettings.getStripeWebhookSecret());
        
        settings.setMpAccessToken(updatedSettings.getMpAccessToken());
        settings.setMpPublicKey(updatedSettings.getMpPublicKey());
        
        settings.setSmtpHost(updatedSettings.getSmtpHost());
        settings.setSmtpPort(updatedSettings.getSmtpPort());
        settings.setSmtpEncryption(updatedSettings.getSmtpEncryption());
        settings.setSmtpUser(updatedSettings.getSmtpUser());
        settings.setSmtpPass(updatedSettings.getSmtpPass());
        
        settings.setVimeoClientId(updatedSettings.getVimeoClientId());
        settings.setVimeoSecret(updatedSettings.getVimeoSecret());
        settings.setVimeoToken(updatedSettings.getVimeoToken());
        
        settings.setTimezone(updatedSettings.getTimezone());
        settings.setSessionTimeout(updatedSettings.getSessionTimeout());
        settings.setMaintenanceMode(updatedSettings.getMaintenanceMode());
        
        settings.setUpdatedAt(OffsetDateTime.now());
        settings.setUpdatedBy(username);
        
        return systemSettingsRepository.save(settings);
    }
}
