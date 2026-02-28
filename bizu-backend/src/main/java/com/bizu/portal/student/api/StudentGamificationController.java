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
    private final com.bizu.portal.identity.application.UserService userService;

    @GetMapping("/me")
    public ResponseEntity<Map<String, Object>> getMyStats(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        
        // Passively update streak on every request to dashboard/stats
        gamificationService.addXp(userId, 0);

        GamificationStats stats = gamificationRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Stats not found after sync"));

        Map<String, Object> response = new HashMap<>();
        response.put("totalXp", stats.getTotalXp());
        response.put("axons", stats.getAxonCoins());
        response.put("currentStreak", stats.getCurrentStreak());
        int currentLevel = levelCalculator.calculateLevel(stats.getTotalXp());
        response.put("level", currentLevel);
        response.put("rank", levelCalculator.calculateRank(currentLevel));
        response.put("nextLevelProgress", levelCalculator.calculateProgressToNextLevel(stats.getTotalXp()));
        response.put("xpToNextLevel", levelCalculator.calculateXpForLevel(currentLevel + 1));
        response.put("levelTable", levelCalculator.getAllLevelRequirements(50));

        return ResponseEntity.ok(response);
    }
}
