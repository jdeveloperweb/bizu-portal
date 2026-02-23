package com.bizu.portal.student.application;

import com.bizu.portal.identity.domain.User;
import com.bizu.portal.student.domain.Badge;
import com.bizu.portal.student.domain.GamificationStats;
import com.bizu.portal.student.domain.UserBadge;
import com.bizu.portal.student.infrastructure.BadgeRepository;
import com.bizu.portal.student.infrastructure.GamificationRepository;
import com.bizu.portal.student.infrastructure.UserBadgeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class GamificationService {

    private final GamificationRepository gamificationRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final LevelCalculator levelCalculator;

    @Transactional
    public void addXp(UUID userId, int amount) {
        GamificationStats stats = gamificationRepository.findById(userId)
            .orElseGet(() -> GamificationStats.builder()
                .userId(userId)
                .totalXp(0)
                .currentStreak(0)
                .build());

        stats.setTotalXp(stats.getTotalXp() + amount);
        stats.setLastActivityAt(OffsetDateTime.now());
        
        gamificationRepository.save(stats);
        log.info("Adicionado {} XP ao usuário {}. Total: {}", amount, userId, stats.getTotalXp());
        
        checkXpBadges(userId, stats.getTotalXp());
    }

    private void checkXpBadges(UUID userId, int totalXp) {
        // Simple logic for XP-based badges
        if (totalXp >= 1000) {
            awardBadge(userId, "FIRST_1000_XP");
        }
    }

    @Transactional
    public void awardBadge(UUID userId, String badgeCode) {
        Optional<Badge> badgeOpt = badgeRepository.findByCode(badgeCode);
        if (badgeOpt.isPresent()) {
            Badge badge = badgeOpt.get();
            boolean alreadyHas = userBadgeRepository.existsByUserIdAndBadgeId(userId, badge.getId());
            
            if (!alreadyHas) {
                User user = new User();
                user.setId(userId);
                
                UserBadge userBadge = UserBadge.builder()
                    .user(user)
                    .badge(badge)
                    .build();
                
                userBadgeRepository.save(userBadge);
                log.info("Badge {} concedida ao usuário {}", badgeCode, userId);
            }
        }
    }
}
