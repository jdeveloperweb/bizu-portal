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
    public Device registerOrUpdateDevice(User user, String fingerprint, String os, String browser, String ip) {
        Device device = deviceRepository.findByUserAndDeviceFingerprint(user, fingerprint)
            .orElseGet(() -> createNewDevice(user, fingerprint, os, browser, ip));

        device.setLastIp(ip);
        device.setLastSeenAt(OffsetDateTime.now());
        device.setOsInfo(os);
        device.setBrowserInfo(browser);

        return deviceRepository.save(device);
    }

    private Device createNewDevice(User user, String fingerprint, String os, String browser, String ip) {
        List<Device> userDevices = deviceRepository.findAllByUser(user);
        
        if (userDevices.size() >= MAX_DEVICES_PER_USER) {
            // Remove the oldest device to make room for the new one (as per policy)
            Device oldest = userDevices.stream()
                .min(Comparator.comparing(Device::getLastSeenAt))
                .orElseThrow();
            deviceRepository.delete(oldest);
        }

        return Device.builder()
            .user(user)
            .deviceFingerprint(fingerprint)
            .osInfo(os)
            .browserInfo(browser)
            .lastIp(ip)
            .isTrusted(false)
            .build();
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
    public boolean isValidDevice(UUID userId, String fingerprint) {
        if (fingerprint == null || fingerprint.isBlank()) {
            return false;
        }
        
        List<Device> userDevices = deviceRepository.findAllByUserId(userId);
        if (userDevices.isEmpty()) {
            // Se não houver nenhum dispositivo registrado, consideramos válido até o próximo registro
            return true;
        }

        return userDevices.stream()
            .anyMatch(d -> d.getDeviceFingerprint().equals(fingerprint));
    }
}
