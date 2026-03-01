package com.bizu.portal.identity.api;

import com.bizu.portal.identity.application.DeviceService;
import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.identity.domain.Device;
import com.bizu.portal.identity.domain.User;
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

    @PostMapping("/register")
    public ResponseEntity<Device> registerDevice(
        @AuthenticationPrincipal Jwt jwt,
        @RequestBody RegisterDeviceRequest request,
        jakarta.servlet.http.HttpServletRequest httpRequest
    ) {
        UUID userId = resolveUserId(jwt);
        User user = userService.findById(userId).orElseThrow();
        
        String ip = httpRequest.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = httpRequest.getRemoteAddr();
        }

        String userAgent = httpRequest.getHeader("User-Agent");
        Device device = deviceService.registerOrUpdateDevice(
            user,
            request.getFingerprint(),
            request.getOs(),
            request.getBrowser(),
            ip,
            userAgent
        );
        
        return ResponseEntity.ok(device);
    }

    @DeleteMapping("/{deviceId}")
    public ResponseEntity<Void> removeDevice(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID deviceId) {
        UUID userId = resolveUserId(jwt);
        deviceService.removeDevice(userId, deviceId);
        return ResponseEntity.noContent().build();
    }

    @lombok.Data
    public static class RegisterDeviceRequest {
        private String fingerprint;
        private String os;
        private String browser;
    }

    private UUID resolveUserId(Jwt jwt) {
        return userService.resolveUserId(jwt);
    }
}
