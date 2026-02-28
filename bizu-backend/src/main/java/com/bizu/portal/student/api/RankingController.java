package com.bizu.portal.student.api;

import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.student.application.RankingService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/ranking")
@RequiredArgsConstructor
public class RankingController {

    private final RankingService rankingService;
    private final UserService userService;

    @GetMapping("/global")
    public ResponseEntity<List<Map<String, Object>>> getGlobalRanking(@RequestParam(required = false) UUID courseId, @RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(rankingService.getGlobalRanking(courseId, limit));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMyRanking(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(rankingService.getUserRanking(userId));
    }
}
