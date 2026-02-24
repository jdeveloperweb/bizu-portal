package com.bizu.portal.student.api;

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

    @GetMapping("/global")
    public ResponseEntity<List<Map<String, Object>>> getGlobalRanking(@RequestParam(defaultValue = "10") int limit) {
        return ResponseEntity.ok(rankingService.getGlobalRanking(limit));
    }

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMyRanking(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(rankingService.getUserRanking(userId));
    }
}
