package com.bizu.portal.identity.api;

import com.bizu.portal.identity.application.DeviceService;
import com.bizu.portal.identity.domain.Device;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;

    @GetMapping
    public ResponseEntity<List<Device>> getMyDevices(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(deviceService.findByUserId(userId));
    }

    @DeleteMapping("/{deviceId}")
    public ResponseEntity<Void> removeDevice(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID deviceId) {
        UUID userId = UUID.fromString(jwt.getSubject());
        // Simple security check: device must belong to user
        deviceService.removeDevice(userId, deviceId);
        return ResponseEntity.noContent().build();
    }
}
