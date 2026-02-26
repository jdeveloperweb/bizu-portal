package com.bizu.portal.identity.api;

import com.bizu.portal.identity.application.DeviceService;
import com.bizu.portal.identity.application.UserService;
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
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<Device>> getMyDevices(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = resolveUserId(jwt);
        return ResponseEntity.ok(deviceService.findByUserId(userId));
    }

    @DeleteMapping("/{deviceId}")
    public ResponseEntity<Void> removeDevice(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID deviceId) {
        UUID userId = resolveUserId(jwt);
        // Simple security check: device must belong to user
        deviceService.removeDevice(userId, deviceId);
        return ResponseEntity.noContent().build();
    }

    private UUID resolveUserId(Jwt jwt) {
        String email = jwt.getClaimAsString("email");
        String name = jwt.getClaimAsString("name");
        UUID subjectId = UUID.fromString(jwt.getSubject());
        return userService.syncUser(subjectId, email, name).getId();
    }
}
