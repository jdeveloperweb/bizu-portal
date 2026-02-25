package com.bizu.portal.student.api;

import com.bizu.portal.commerce.application.EntitlementService;
import com.bizu.portal.commerce.domain.CourseEntitlement;
import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.identity.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/entitlements")
@RequiredArgsConstructor
public class StudentEntitlementController {

    private final EntitlementService entitlementService;
    private final UserRepository userRepository;
    private final UserService userService;

    @GetMapping("/me")
    public ResponseEntity<List<CourseEntitlement>> getMyEntitlements(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(entitlementService.getActiveEntitlements(userId));
    }
    
    @GetMapping("/check/{courseId}")
    public ResponseEntity<Boolean> checkAccess(
            @AuthenticationPrincipal Jwt jwt,
            @PathVariable UUID courseId) {
        UUID userId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(entitlementService.hasAccess(userId, courseId));
    }
}
