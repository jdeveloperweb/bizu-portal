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
import com.bizu.portal.identity.application.DeviceLimitReachedException;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/devices")
@RequiredArgsConstructor
public class DeviceController {

    private final DeviceService deviceService;
    private final UserService userService;
    private final com.bizu.portal.notification.application.VerificationService verificationService;

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
        
        String ip = resolveIp(httpRequest);
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

    @PostMapping("/send-code")
    public ResponseEntity<?> sendVerificationCode(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody SendCodeRequest request
    ) {
        UUID userId = resolveUserId(jwt);
        User user = userService.findById(userId).orElseThrow();
        
        String recipient = "EMAIL".equalsIgnoreCase(request.getType()) ? user.getEmail() : user.getPhone();
        if (recipient == null || recipient.isBlank()) {
            return ResponseEntity.badRequest().body("Usuário não possui " + request.getType() + " cadastrado.");
        }

        verificationService.generateAndSendCode(recipient, user.getName(), request.getType());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/verify-and-register")
    public ResponseEntity<Device> verifyAndRegister(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody VerifyAndRegisterRequest request,
            jakarta.servlet.http.HttpServletRequest httpRequest
    ) {
        UUID userId = resolveUserId(jwt);
        User user = userService.findById(userId).orElseThrow();
        
        String recipient = "EMAIL".equalsIgnoreCase(request.getType()) ? user.getEmail() : user.getPhone();
        
        if (!verificationService.validateCode(recipient, request.getType(), request.getCode())) {
            return ResponseEntity.badRequest().build();
        }

        String ip = resolveIp(httpRequest);
        String userAgent = httpRequest.getHeader("User-Agent");

        Device device = deviceService.replaceDeviceWithVerification(
                user,
                request.getFingerprint(),
                request.getOs(),
                request.getBrowser(),
                ip,
                userAgent
        );
        
        return ResponseEntity.ok(device);
    }

    @ExceptionHandler(DeviceLimitReachedException.class)
    public ResponseEntity<?> handleDeviceLimit(DeviceLimitReachedException ex) {
        return ResponseEntity.status(409).body(java.util.Map.of(
            "error", "DEVICE_LIMIT_REACHED",
            "maskedEmail", ex.getMaskedEmail(),
            "maskedPhone", ex.getMaskedPhone()
        ));
    }

    @DeleteMapping("/{deviceId}")
    public ResponseEntity<Void> removeDevice(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID deviceId) {
        UUID userId = resolveUserId(jwt);
        deviceService.removeDevice(userId, deviceId);
        return ResponseEntity.noContent().build();
    }

    @lombok.Data
    public static class SendCodeRequest {
        private String type; // EMAIL or WHATSAPP
    }

    @lombok.Data
    public static class VerifyAndRegisterRequest {
        private String code;
        private String type;
        private String fingerprint;
        private String os;
        private String browser;
    }

    @lombok.Data
    public static class RegisterDeviceRequest {
        private String fingerprint;
        private String os;
        private String browser;
    }

    private String resolveIp(jakarta.servlet.http.HttpServletRequest httpRequest) {
        String ip = httpRequest.getHeader("X-Forwarded-For");
        if (ip == null || ip.isEmpty()) {
            ip = httpRequest.getRemoteAddr();
        }
        return ip;
    }

    private UUID resolveUserId(Jwt jwt) {
        return userService.resolveUserId(jwt);
    }
}
