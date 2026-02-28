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
    private final com.bizu.portal.student.infrastructure.BadgeRepository badgeRepository;
    private final com.bizu.portal.student.infrastructure.UserBadgeRepository userBadgeRepository;
    private final com.bizu.portal.student.infrastructure.InventoryRepository inventoryRepository;
    private final LevelCalculator levelCalculator;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @Transactional
    public java.util.List<BadgeDTO> getBadgesWithProgress(UUID userId) {
        ensureBadgesExist();
        java.util.List<Badge> allBadges = badgeRepository.findAll();
        java.util.List<UserBadge> earnedBadges = userBadgeRepository.findAllByUserId(userId);

        Map<UUID, UserBadge> earnedMap = earnedBadges.stream()
                .collect(Collectors.toMap(ub -> ub.getBadge().getId(), ub -> ub));

        // Get stats for progress estimation
        int totalQuestions = jdbcTemplate.queryForObject("""
            SELECT 
                (SELECT COUNT(*) FROM student.attempts WHERE user_id = ?) +
                (SELECT COUNT(*) FROM student.activity_attempt_item_snapshots s JOIN student.activity_attempts a ON s.attempt_id = a.id WHERE a.user_id = ? AND s.student_selected_option IS NOT NULL) +
                (SELECT COUNT(*) FROM student.duel_questions dq JOIN student.duels d ON dq.duel_id = d.id WHERE d.challenger_id = ? AND dq.challenger_answer_index IS NOT NULL) +
                (SELECT COUNT(*) FROM student.duel_questions dq JOIN student.duels d ON dq.duel_id = d.id WHERE d.opponent_id = ? AND dq.opponent_answer_index IS NOT NULL)
            """, Integer.class, userId, userId, userId, userId);
        int totalWins = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM student.duels WHERE winner_id = ? AND status = 'COMPLETED'", Integer.class, userId);
        int totalFlashcards = jdbcTemplate.queryForObject("SELECT COUNT(*) FROM student.flashcard_progress WHERE user_id = ?", Integer.class, userId);
        
        // Time spent today (Maratonista) - Unified calculation
        int timeTodayMinutes = jdbcTemplate.queryForObject("""
            SELECT (
                (SELECT COALESCE(SUM(time_spent_seconds), 0) FROM student.attempts WHERE user_id = ? AND created_at >= CURRENT_DATE) +
                (SELECT COALESCE(SUM(s.time_spent_seconds), 0) FROM student.activity_attempt_item_snapshots s JOIN student.activity_attempts a ON s.attempt_id = a.id WHERE a.user_id = ? AND s.student_selected_option IS NOT NULL AND (COALESCE(s.answered_at, a.created_at) >= CURRENT_DATE)) +
                (SELECT COUNT(*) * 30 FROM student.duel_questions dq JOIN student.duels d ON dq.duel_id = d.id WHERE (d.challenger_id = ? OR d.opponent_id = ?) AND (d.challenger_id = ? AND dq.challenger_answer_index IS NOT NULL OR d.opponent_id = ? AND dq.opponent_answer_index IS NOT NULL) AND dq.created_at >= CURRENT_DATE)
            ) / 60
            """, Integer.class, userId, userId, userId, userId, userId, userId);

        // Sniper progress (last 10 hard questions)
        int correctHardStreak = jdbcTemplate.queryForObject(
            "SELECT COUNT(*) FROM (SELECT is_correct FROM student.attempts a JOIN content.questions q ON a.question_id = q.id WHERE a.user_id = ? AND q.difficulty = 'HARD' ORDER BY a.created_at DESC LIMIT 10) sub WHERE is_correct = true",
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
                currentVal = calculateCurrentProgressValue(userId, badge.getCode(), streak, totalQuestions, totalWins, totalFlashcards, timeTodayMinutes, correctHardStreak);

                // CAP at target
                if (currentVal >= target) {
                    currentVal = target;
                    // Auto-award if not earned (lazy evaluation)
                    awardBadge(userId, badge.getCode());
                    dto.setEarned(true);
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

    private int calculateCurrentProgressValue(UUID userId, String code, int streak, int totalQuestions, int totalWins, int totalFlashcards, int timeTodayMinutes, int correctHardStreak) {
        if ("EARLY_BIRD".equals(code)) {
            // Check if solved any question between 00:00 and 06:00
            return jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM student.attempts WHERE user_id = ? AND EXTRACT(HOUR FROM created_at AT TIME ZONE 'UTC') < 6", 
                Integer.class, userId) > 0 ? 1 : 0;
        } else if ("FIRST_SIMULADO".equals(code)) {
             return jdbcTemplate.queryForObject(
                "SELECT COUNT(*) FROM student.simulado_results WHERE user_id = ?", 
                Integer.class, userId) > 0 ? 1 : 0;
        } else if ("STREAK_7".equals(code) || "TOTAL_DEDICATION".equals(code)) {
            return streak;
        } else if ("QUESTIONS_1000".equals(code) || "MASTER_100".equals(code)) {
            return totalQuestions;
        } else if ("GLADIATOR_10".equals(code)) {
            return totalWins;
        } else if ("STUDIOUS_50".equals(code)) {
            return totalFlashcards;
        } else if ("MARATHON_4H".equals(code)) {
            return timeTodayMinutes;
        } else if ("SNIPER_10".equals(code)) {
            return correctHardStreak;
        } else if ("FIRST_1000_XP".equals(code)) {
            GamificationStats stats = gamificationRepository.findById(userId).orElse(null);
            return stats != null ? stats.getTotalXp() : 0;
        }
        return 0;
    }

    private void ensureBadgesExist() {
        if (badgeRepository.count() > 0) return;

        log.info("Seeding default badges...");
        
        java.util.List<Badge> defaults = new java.util.ArrayList<>();
        
        defaults.add(Badge.builder().code("EARLY_BIRD").name("Madrugador").description("Resolveu questões antes das 6h da manhã.").iconUrl("sunrise").category("consistencia").xp(50).color("from-amber-400 to-orange-500").targetProgress(1).requirement("1/1").build());
        defaults.add(Badge.builder().code("STREAK_7").name("Fogo Amigo").description("Manteve uma ofensiva de 7 dias.").iconUrl("flame").category("consistencia").xp(100).color("from-red-400 to-rose-500").targetProgress(7).requirement("7/7 dias").build());
        defaults.add(Badge.builder().code("MASTER_100").name("Centenário").description("Resolveu 100 questões com aproveitamento > 80%.").iconUrl("target").category("performance").xp(200).color("from-emerald-400 to-teal-500").targetProgress(100).requirement("100/100").build());
        defaults.add(Badge.builder().code("FIRST_SIMULADO").name("Primeiro Passo").description("Concluiu seu primeiro simulado completo.").iconUrl("play").category("performance").xp(75).color("from-blue-400 to-indigo-500").targetProgress(1).requirement("1/1").build());
        defaults.add(Badge.builder().code("MARATHON_4H").name("Maratonista").description("Estudou por mais de 4 horas seguidas.").iconUrl("clock").category("consistencia").xp(150).color("from-indigo-400 to-violet-500").targetProgress(240).requirement("240/240 minutos").build());
        defaults.add(Badge.builder().code("SNIPER_10").name("Sniper").description("Acertou 10 questões seguidas de nível difícil.").iconUrl("target").category("performance").xp(300).color("from-red-500 to-pink-600").targetProgress(10).requirement("10/10 consecutivas").build());
        defaults.add(Badge.builder().code("GLADIATOR_10").name("Gladiador").description("Venceu 10 duelos na Arena PVP.").iconUrl("swords").category("social").xp(150).color("from-violet-500 to-purple-600").targetProgress(10).requirement("10/10 duelos").build());
        defaults.add(Badge.builder().code("STUDIOUS_50").name("Estudioso").description("Criou 50 flashcards.").iconUrl("layers").category("especial").xp(100).color("from-teal-400 to-cyan-500").targetProgress(50).requirement("50/50 flashcards").build());
        defaults.add(Badge.builder().code("TOTAL_DEDICATION").name("Dedicação Total").description("Manteve ofensiva de 30 dias.").iconUrl("flame").category("consistencia").xp(500).color("from-orange-500 to-red-600").targetProgress(30).requirement("30/30 dias").build());
        defaults.add(Badge.builder().code("QUESTIONS_1000").name("1000 Questões").description("Resolveu 1000 questões na plataforma.").iconUrl("checkCircle2").category("performance").xp(250).color("from-emerald-500 to-green-600").targetProgress(1000).requirement("1000/1000").build());
        defaults.add(Badge.builder().code("FIRST_1000_XP").name("Rumo ao Topo").description("Alcançou a marca de 1000 XP totais.").iconUrl("zap").category("especial").xp(100).color("from-indigo-400 to-violet-500").targetProgress(1000).requirement("1000/1000 XP").build());

        badgeRepository.saveAll(defaults);
        log.info("Badges seeded.");
    }

    @Transactional
    public RewardDTO addXp(UUID userId, int amount) {
        GamificationStats stats = gamificationRepository.findById(userId)
            .orElseGet(() -> GamificationStats.builder()
                .userId(userId)
                .totalXp(0)
                .axonCoins(0)
                .currentStreak(0)
                .maxStreak(0)
                .build());

        int previousXp = stats.getTotalXp();
        int previousLevel = levelCalculator.calculateLevel(previousXp);
        
        stats.setTotalXp(previousXp + amount);
        
        // Award AxonCoins - 1 coin per 1 XP gained
        if (amount > 0) {
            stats.setAxonCoins((stats.getAxonCoins() != null ? stats.getAxonCoins() : 0) + amount);
        }
        
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
                } else if (nowDate.isAfter(lastDate.plusDays(1))) {
                    // Missed one or more days. Check for STREAK_FREEZE.
                    long daysMissed = java.time.temporal.ChronoUnit.DAYS.between(lastDate, nowDate) - 1;
                    
                    Optional<com.bizu.portal.student.domain.Inventory> freeze = inventoryRepository.findByUserIdAndItemCode(stats.getUserId(), "STREAK_FREEZE");
                    if (freeze.isPresent() && freeze.get().getQuantity() > 0) {
                        int available = freeze.get().getQuantity();
                        int toConsume = (int) Math.min(daysMissed, available);
                        
                        freeze.get().setQuantity(available - toConsume);
                        inventoryRepository.save(freeze.get());
                        
                        // Keep the streak as if they did study those days (active maintenance)
                        // Or just bridge the gap
                        if (toConsume >= daysMissed) {
                            // Perfect protection
                            stats.setCurrentStreak(stats.getCurrentStreak() + 1);
                            log.info("Usuário {} usou {} Escudo(s) de Ofensiva para manter a streak.", stats.getUserId(), toConsume);
                        } else {
                            // Protection failed (not enough items)
                            stats.setCurrentStreak(1);
                        }
                    } else {
                        // Quebrou a sequência
                        stats.setCurrentStreak(1);
                    }
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
        // Broad check for badges that might be earned
        badgeRepository.findAll().forEach(badge -> {
            int target = badge.getTargetProgress() != null && badge.getTargetProgress() > 0 ? badge.getTargetProgress() : 1;
            
            // For FIRST_1000_XP specifically
            if ("FIRST_1000_XP".equals(badge.getCode()) && totalXp >= target) {
                awardBadge(userId, badge.getCode());
            }
        });
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

                // Grant XP for the badge
                if (badge.getXp() != null && badge.getXp() > 0) {
                    addXp(userId, badge.getXp());
                }
            }
        }
    }
}
