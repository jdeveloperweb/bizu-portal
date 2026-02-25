package com.bizu.portal.identity.api;

import com.bizu.portal.analytics.application.AnalyticsService;
import com.bizu.portal.content.infrastructure.CourseRepository;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class MeController {

    private final UserRepository userRepository;
    private final CourseRepository courseRepository;
    private final AnalyticsService analyticsService;

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
    public ResponseEntity<User> updateMe(@AuthenticationPrincipal Jwt jwt, @RequestBody UpdateMeRequest request) {
        String email = jwt.getClaim("email");
        return userRepository.findByEmail(email)
            .map(user -> {
                if (request.name() != null) user.setName(request.name());
                if (request.phone() != null) user.setPhone(request.phone());
                return ResponseEntity.ok(userRepository.save(user));
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    public record UpdateMeRequest(String name, String phone) {}

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
}
