package com.bizu.portal.student.api;

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

@RestController
@RequestMapping("/api/v1/student/badges")
@RequiredArgsConstructor
public class StudentBadgeController {

    private final UserBadgeRepository userBadgeRepository;

    @GetMapping("/me")
    public ResponseEntity<List<UserBadge>> getMyBadges(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(userBadgeRepository.findAllByUserId(userId));
    }
}
