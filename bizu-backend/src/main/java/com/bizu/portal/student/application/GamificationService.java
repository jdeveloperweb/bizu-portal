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

        // Get stats for progress estimation
        int totalQuestions = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM student.attempts WHERE user_id = ?", Integer.class, userId);
        int totalDuels = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM student.duels WHERE (challenger_id = ? OR opponent_id = ?) AND status = 'COMPLETED'", Integer.class, userId, userId);
        int totalFlashcards = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM student.flashcard_progress WHERE user_id = ?", Integer.class, userId);
        
        // Time spent today (Maratonista)
        int timeTodayMinutes = jdbcTemplate.queryForObject(
            "SELECT COALESCE(SUM(time_spent_seconds), 0) / 60 FROM student.attempts WHERE user_id = ? AND created_at >= CURRENT_DATE", 
            Integer.class, userId);

        // Sniper progress (last 10 hard questions)
        int correctHardStreak = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM (SELECT correct FROM student.attempts a JOIN content.questions q ON a.question_id = q.id WHERE a.user_id = ? AND q.difficulty = 'HARD' ORDER BY a.created_at DESC LIMIT 10) sub WHERE correct = true",
            Integer.class, userId);

        GamificationStats stats = gamificationRepository.findById(userId).orElse(null);
        int streak = stats != null ? stats.getCurrentStreak() : 0;

        return allBadges.stream().map(badge -> {
            UserBadge userBadge = earnedMap.get(badge.getId());
            boolean earned = userBadge != null;
            int target = badge.getTargetProgress() != null && badge.getTargetProgress() > 0 ? badge.getTargetProgress() : 1;
            
            BadgeDTO dto = BadgeDTO.builder()
                    .id(badge.getId())
                    .name(badge.getName())
                    .description(badge.getDescription())
                    .icon(badge.getIconUrl())
                    .earned(earned)
                    .category(badge.getCategory() != null ? badge.getCategory() : "todas")
                    .xp(badge.getXp() != null ? badge.getXp() : badge.getRequiredXp())
                    .color(badge.getColor())
                    .build();

            int currentVal = 0;
            if (earned) {
                dto.setEarnedDate(userBadge.getEarnedAt());
                dto.setProgress(100);
                currentVal = target;
            } else {
                // Calculate progress based on logic
                if ("EARLY_BIRD".equals(badge.getCode()) || "FIRST_SIMULADO".equals(badge.getCode())) {
                    currentVal = 0; 
                } else if ("STREAK_7".equals(badge.getCode()) || "TOTAL_DEDICATION".equals(badge.getCode())) {
                    currentVal = streak;
                } else if ("QUESTIONS_1000".equals(badge.getCode()) || "MASTER_100".equals(badge.getCode())) {
                    currentVal = totalQuestions;
                } else if ("GLADIATOR_10".equals(badge.getCode())) {
                    currentVal = totalDuels;
                } else if ("STUDIOUS_50".equals(badge.getCode())) {
                    currentVal = totalFlashcards;
                } else if ("MARATHON_4H".equals(badge.getCode())) {
                    currentVal = timeTodayMinutes;
                } else if ("SNIPER_10".equals(badge.getCode())) {
                    currentVal = correctHardStreak;
                }

                // CAP at target
                if (currentVal >= target) {
                    currentVal = target;
                }
                
                int percent = (int) Math.round(((double) currentVal / target) * 100);
                dto.setProgress(Math.min(percent, 100));
            }

            // Dynamic requirement string
            String reqBase = badge.getRequirement() != null ? badge.getRequirement() : "";
            if (reqBase.contains("/")) {
                String suffix = reqBase.substring(reqBase.indexOf("/") + 1).replaceAll("^[0-9]+", "").trim();
                dto.setRequirement(currentVal + "/" + target + (suffix.isEmpty() ? "" : " " + suffix));
            } else {
                dto.setRequirement(currentVal + "/" + target + " " + reqBase);
            }
            
            return dto;
        }).collect(Collectors.toList());
    }

    @Transactional
    public RewardDTO addXp(UUID userId, int amount) {
        GamificationStats stats = gamificationRepository.findById(userId)
            .orElseGet(() -> GamificationStats.builder()
                .userId(userId)
                .totalXp(0)
                .currentStreak(0)
                .maxStreak(0)
                .build());

        int previousXp = stats.getTotalXp();
        int previousLevel = levelCalculator.calculateLevel(previousXp);
        
        stats.setTotalXp(previousXp + amount);
        
        // Update streak
        updateStreakLogic(stats);
        
        gamificationRepository.save(stats);
        
        int currentXp = stats.getTotalXp();
        int currentLevel = levelCalculator.calculateLevel(currentXp);
        boolean leveledUp = currentLevel > previousLevel;
        
        log.info("Adicionado {} XP ao usuário {}. Total: {}. Nível: {}", amount, userId, currentXp, currentLevel);
        
        checkXpBadges(userId, currentXp);
        
        return RewardDTO.builder()
            .xpGained(amount)
            .totalXp(currentXp)
            .currentLevel(currentLevel)
            .previousLevel(previousLevel)
            .leveledUp(leveledUp)
            .nextLevelProgress(levelCalculator.calculateProgressToNextLevel(currentXp))
            .build();
    }

    private void updateStreakLogic(GamificationStats stats) {
        java.time.OffsetDateTime now = java.time.OffsetDateTime.now();
        java.time.OffsetDateTime lastActivity = stats.getLastActivityAt();

        if (lastActivity == null) {
            stats.setCurrentStreak(1);
            stats.setMaxStreak(1);
        } else {
            java.time.LocalDate lastDate = lastActivity.toLocalDate();
            java.time.LocalDate nowDate = now.toLocalDate();

            if (nowDate.isAfter(lastDate)) {
                if (nowDate.minusDays(1).equals(lastDate)) {
                    // Consecutivo
                    stats.setCurrentStreak(stats.getCurrentStreak() + 1);
                } else {
                    // Quebrou a sequência
                    stats.setCurrentStreak(1);
                }
                
                if (stats.getMaxStreak() == null || stats.getCurrentStreak() > stats.getMaxStreak()) {
                    stats.setMaxStreak(stats.getCurrentStreak());
                }
            }
            // Se for o mesmo dia, não faz nada com o contador da streak, apenas atualiza o timestamp se quiser
        }
        stats.setLastActivityAt(now);
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
