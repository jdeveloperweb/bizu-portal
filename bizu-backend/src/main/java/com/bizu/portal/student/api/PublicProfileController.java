package com.bizu.portal.student.api;

import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.student.application.PublicProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/profile")
@RequiredArgsConstructor
public class PublicProfileController {

    private final PublicProfileService profileService;
    private final UserService userService;

    @GetMapping("/{nickname}")
    public ResponseEntity<Map<String, Object>> getProfile(@AuthenticationPrincipal Jwt jwt, @PathVariable String nickname) {
        UUID currentUserId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(profileService.getUserProfile(nickname, currentUserId));
    }
}
