package com.bizu.portal.identity.api;

import com.bizu.portal.analytics.application.AnalyticsService;
import com.bizu.portal.content.infrastructure.CourseRepository;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.UserRepository;
import com.bizu.portal.shared.application.FileStorageService;
import lombok.RequiredArgsConstructor;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class MeController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final AnalyticsService analyticsService;
    private final FileStorageService storageService;
    private final com.bizu.portal.notification.application.VerificationService verificationService;
    private final com.bizu.portal.identity.infrastructure.KeycloakService keycloakService;

    @GetMapping("/me")
    public ResponseEntity<User> getMe(@AuthenticationPrincipal Jwt jwt) {
        String email = jwt.getClaim("email");
        return userRepository.findByEmail(email)
            .map(user -> {
                analyticsService.trackActivity(user.getId(), "LOGIN");
                return ResponseEntity.ok(user);
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PutMapping("/me")
    public ResponseEntity<?> updateMe(@AuthenticationPrincipal Jwt jwt, @RequestBody UpdateMeRequest request) {
        String email = jwt.getClaim("email");
        return userRepository.findByEmail(email)
            .map(user -> {
                if (request.nickname() != null && !request.nickname().isBlank() && !request.nickname().equals(user.getNickname())) {
                    if (userRepository.findByNickname(request.nickname()).isPresent()) {
                        return ResponseEntity.badRequest().body("Nickname already exists");
                    }
                    user.setNickname(request.nickname());
                }
                if (request.name() != null) user.setName(request.name());
                return ResponseEntity.ok(userRepository.save(user));
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/me/avatar")
    public ResponseEntity<User> uploadAvatar(@AuthenticationPrincipal Jwt jwt, @RequestParam("file") MultipartFile file) {
        String email = jwt.getClaim("email");
        return userRepository.findByEmail(email)
            .map(user -> {
                String filename = storageService.store(file);
                String url = "/public/files/" + filename;
                user.setAvatarUrl(url);
                return ResponseEntity.ok(userRepository.save(user));
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record UpdateMeRequest(String name, String phone, String nickname) {}

    @PutMapping("/me/settings")
    public ResponseEntity<User> updateSettings(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, Object> settingsRequest) {
        String email = jwt.getClaim("email");

        return userRepository.findByEmail(email)
            .map(user -> {
                Map<String, Object> metadata = user.getMetadata() != null
                    ? new HashMap<>(user.getMetadata())
                    : new HashMap<>();
                metadata.put("settings", settingsRequest);
                user.setMetadata(metadata);
                return ResponseEntity.ok(userRepository.save(user));
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @PostMapping("/me/request-phone-change")
    public ResponseEntity<?> requestPhoneChange(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, String> request) {
        String newPhone = request.get("phone");
        if (newPhone == null || newPhone.isBlank()) return ResponseEntity.badRequest().body("Telefone inválido");

        String name = jwt.getClaim("name");
        verificationService.generateAndSendCode(newPhone, name, "PHONE_CHANGE");
        return ResponseEntity.ok().build();
    }

    @PostMapping("/me/confirm-phone-change")
    public ResponseEntity<?> confirmPhoneChange(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, String> request) {
        String newPhone = request.get("phone");
        String code = request.get("code");
        if (newPhone == null || code == null) return ResponseEntity.badRequest().body("Dados incompletos");

        if (verificationService.validateCode(newPhone, "PHONE_CHANGE", code)) {
            String email = jwt.getClaim("email");
            return userRepository.findByEmail(email)
                .map(user -> {
                    user.setPhone(newPhone);
                    User saved = userRepository.save(user);
                    return ResponseEntity.ok(saved);
                }).orElseGet(() -> ResponseEntity.notFound().build());
        }
        return ResponseEntity.badRequest().body("Código inválido ou expirado");
    }

    @PostMapping("/me/duel-focus")
    public ResponseEntity<User> toggleDuelFocus(@AuthenticationPrincipal Jwt jwt, @RequestParam boolean enabled) {
        String email = jwt.getClaim("email");
        return userRepository.findByEmail(email)
            .map(user -> {
                user.setDuelFocusMode(enabled);
                return ResponseEntity.ok(userRepository.save(user));
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }
}
