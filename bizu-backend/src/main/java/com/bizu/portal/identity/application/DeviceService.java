package com.bizu.portal.identity.application;

import com.bizu.portal.identity.domain.Device;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.DeviceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class DeviceService {

    private final DeviceRepository deviceRepository;
    private static final int MAX_DEVICES_PER_USER = 1;

    @Transactional
    public Device registerOrUpdateDevice(User user, String fingerprint, String os, String browser, String ip, String userAgent) {
        Device device = deviceRepository.findByUserAndDeviceFingerprint(user, fingerprint)
            .orElseGet(() -> createNewDevice(user, fingerprint, os, browser, ip, userAgent));

        device.setLastIp(ip);
        device.setLastSeenAt(OffsetDateTime.now());
        device.setOsInfo(os);
        device.setBrowserInfo(browser);
        device.setUserAgent(userAgent);

        return deviceRepository.save(device);
    }

    private Device createNewDevice(User user, String fingerprint, String os, String browser, String ip, String userAgent) {
        List<Device> userDevices = deviceRepository.findAllByUser(user);
        
        if (userDevices.size() >= MAX_DEVICES_PER_USER) {
            // ADMINs podem ter múltiplos dispositivos sem limite
            // Melhoramos a checagem de ADMIN para ser mais resiliente, incluindo papéis de TI/Master
            boolean isAdmin = user.getRoles().stream()
                                .anyMatch(r -> r.getName().equalsIgnoreCase("ADMIN") ||
                                               r.getName().equalsIgnoreCase("MASTER") ||
                                               r.getName().equalsIgnoreCase("DEV") ||
                                               r.getName().equalsIgnoreCase("COORDINATOR")) ||
                             (user.getEmail() != null && user.getEmail().toLowerCase().contains("admin"));
            
            if (!isAdmin) {
                String maskedEmail = maskEmail(user.getEmail());
                String maskedPhone = maskPhone(user.getPhone());
                throw new DeviceLimitReachedException(maskedEmail, maskedPhone);
            }
        }

        return Device.builder()
            .user(user)
            .deviceFingerprint(fingerprint)
            .osInfo(os)
            .browserInfo(browser)
            .userAgent(userAgent)
            .lastIp(ip)
            .isTrusted(false)
            .build();
    }

    private String maskEmail(String email) {
        if (email == null || !email.contains("@")) return email;
        String[] parts = email.split("@");
        String local = parts[0];
        if (local.length() <= 4) return "***@" + parts[1];
        String start = local.substring(0, 2);
        String end = local.substring(local.length() - 2);
        return start + "..." + end + "@" + parts[1];
    }

    private String maskPhone(String phone) {
        if (phone == null || phone.length() < 4) return phone;
        return "..." + phone.substring(phone.length() - 4);
    }

    @Transactional
    public Device replaceDeviceWithVerification(User user, String fingerprint, String os, String browser, String ip, String userAgent) {
        // Find existing device(s) and remove them (since limit is 1)
        List<Device> userDevices = deviceRepository.findAllByUser(user);
        for (Device d : userDevices) {
            deviceRepository.delete(d);
        }
        
        // Register the new one
        Device newDevice = Device.builder()
            .user(user)
            .deviceFingerprint(fingerprint)
            .osInfo(os)
            .browserInfo(browser)
            .userAgent(userAgent)
            .lastIp(ip)
            .isTrusted(true)
            .build();
            
        return deviceRepository.save(newDevice);
    }

    public List<Device> findByUserId(UUID userId) {
        return deviceRepository.findAllByUserId(userId);
    }

    @Transactional
    public void removeDevice(UUID userId, UUID deviceId) {
        Device device = deviceRepository.findById(deviceId)
            .orElseThrow(() -> new RuntimeException("Dispositivo não encontrado"));
        
        if (!device.getUser().getId().equals(userId)) {
            throw new RuntimeException("Não autorizado");
        }
        
        deviceRepository.delete(device);
    }
    @Transactional(readOnly = true)
    public boolean isValidDevice(UUID userId, String fingerprint, String currentUserAgent) {
        if (fingerprint == null || fingerprint.isBlank()) {
            return false;
        }
        
        List<Device> userDevices = deviceRepository.findAllByUserId(userId);
        if (userDevices.isEmpty()) {
            // Se não houver nenhum dispositivo registrado, consideramos válido até o próximo registro
            return true;
        }

        return userDevices.stream()
            .anyMatch(d -> {
                boolean fingerprintMatch = d.getDeviceFingerprint().equals(fingerprint);
                if (!fingerprintMatch) return false;
                
                // Se o fingerprint bater, também validamos se o User-Agent é o mesmo.
                // Se o registro antigo não tinha User-Agent (migração), permitimos e atualizamos depois.
                if (d.getUserAgent() == null) return true;
                
                return d.getUserAgent().equals(currentUserAgent);
            });
    }
}
