package com.bizu.portal.student.api;

import com.bizu.portal.student.application.GamificationService;
import com.bizu.portal.student.application.LevelCalculator;
import com.bizu.portal.student.domain.GamificationStats;
import com.bizu.portal.student.infrastructure.GamificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/gamification")
@RequiredArgsConstructor
public class StudentGamificationController {

    private final GamificationService gamificationService;
    private final GamificationRepository gamificationRepository;
    private final LevelCalculator levelCalculator;

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMyStats(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        
        // Passively update streak on every request to dashboard/stats
        gamificationService.addXp(userId, 0);

        GamificationStats stats = gamificationRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Stats not found after sync"));

        Map<String, Object> response = new HashMap<>();
        response.put("totalXp", stats.getTotalXp());
        response.put("currentStreak", stats.getCurrentStreak());
        response.put("level", levelCalculator.calculateLevel(stats.getTotalXp()));
        response.put("nextLevelProgress", levelCalculator.calculateProgressToNextLevel(stats.getTotalXp()));
        response.put("xpToNextLevel", levelCalculator.calculateXpForLevel(levelCalculator.calculateLevel(stats.getTotalXp()) + 1));

        return ResponseEntity.ok(response);
    }
}
