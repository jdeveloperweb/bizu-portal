package com.bizu.portal.student.api;

import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.student.domain.UserBadge;
import com.bizu.portal.student.infrastructure.UserBadgeRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.UUID;

import com.bizu.portal.student.application.GamificationService;
import com.bizu.portal.student.application.BadgeDTO;

@RestController
@RequestMapping("/api/v1/student/badges")
@RequiredArgsConstructor
public class StudentBadgeController {

    private final GamificationService gamificationService;
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<List<BadgeDTO>> getMyBadges(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(gamificationService.getBadgesWithProgress(userId));
    }
}
