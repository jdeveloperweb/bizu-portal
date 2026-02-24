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
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class GamificationService {

    private final GamificationRepository gamificationRepository;
    private final BadgeRepository badgeRepository;
    private final UserBadgeRepository userBadgeRepository;
    private final LevelCalculator levelCalculator;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Transactional(readOnly = true)
    public java.util.List<BadgeDTO> getBadgesWithProgress(UUID userId) {
        java.util.List<Badge> allBadges = badgeRepository.findAll();
        java.util.List<UserBadge> earnedBadges = userBadgeRepository.findAllByUserId(userId);

        Map<UUID, UserBadge> earnedMap = earnedBadges.stream()
                .collect(Collectors.toMap(ub -> ub.getBadge().getId(), ub -> ub));

        // Let's get generic counts for progress estimation
        int totalQuestions = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM student.attempts WHERE user_id = ?", Integer.class, userId);
        int totalDuels = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM student.duels WHERE (challenger_id = ? OR opponent_id = ?) AND status = 'COMPLETED'", Integer.class, userId, userId);
        int totalFlashcards = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM student.flashcard_progress WHERE user_id = ?", Integer.class, userId);
        
        GamificationStats stats = gamificationRepository.findById(userId).orElse(null);
        int streak = stats != null ? stats.getCurrentStreak() : 0;

        return allBadges.stream().map(badge -> {
            UserBadge userBadge = earnedMap.get(badge.getId());
            boolean earned = userBadge != null;
            
            BadgeDTO dto = BadgeDTO.builder()
                    .id(badge.getId())
                    .name(badge.getName())
                    .description(badge.getDescription())
                    .icon(badge.getIconUrl())
                    .earned(earned)
                    .category(badge.getCategory() != null ? badge.getCategory() : "todas")
                    .xp(badge.getXp() != null ? badge.getXp() : badge.getRequiredXp())
                    .requirement(badge.getRequirement())
                    .color(badge.getColor())
                    .build();

            if (earned) {
                dto.setEarnedDate(userBadge.getEarnedAt());
                dto.setProgress(100);
            } else {
                // Calculate progress based on logic
                int currentVal = 0;
                if ("EARLY_BIRD".equals(badge.getCode()) || "FIRST_SIMULADO".equals(badge.getCode())) {
                    currentVal = 0; // Usually triggered by explicit action, not a count.
                } else if ("STREAK_7".equals(badge.getCode())) {
                    currentVal = streak;
                } else if ("TOTAL_DEDICATION".equals(badge.getCode())) {
                    currentVal = streak;
                } else if ("QUESTIONS_1000".equals(badge.getCode()) || "MASTER_100".equals(badge.getCode())) {
                    currentVal = totalQuestions;
                } else if ("GLADIATOR_10".equals(badge.getCode())) {
                    currentVal = totalDuels;
                } else if ("STUDIOUS_50".equals(badge.getCode())) {
                    currentVal = totalFlashcards;
                }

                int target = badge.getTargetProgress() != null && badge.getTargetProgress() > 0 ? badge.getTargetProgress() : 1;
                // CAP at target
                if (currentVal >= target) {
                    currentVal = target; // Though if it reached target it should have been earned technically. We just cap progress until they earn it.
                }
                
                int percent = (int) Math.round(((double) currentVal / target) * 100);
                dto.setProgress(Math.min(percent, 100));
            }
            
            return dto;
        }).collect(Collectors.toList());
    }

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
