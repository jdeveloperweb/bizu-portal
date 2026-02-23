package com.bizu.portal.identity.api;

import com.bizu.portal.analytics.application.AnalyticsService;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import java.util.UUID;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/users")
@RequiredArgsConstructor
public class MeController {

    private final UserRepository userRepository;
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
}
