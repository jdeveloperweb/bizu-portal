package com.bizu.portal.student.application;

import com.bizu.portal.student.domain.Quest;
import com.bizu.portal.student.domain.QuestClaim;
import com.bizu.portal.student.infrastructure.QuestClaimRepository;
import com.bizu.portal.student.infrastructure.QuestRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.WeekFields;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuestService {

    private final QuestRepository questRepository;
    private final QuestClaimRepository questClaimRepository;
    private final GamificationService gamificationService;
    private final JdbcTemplate jdbcTemplate;

    public List<QuestDTO> getUserQuests(UUID userId) {
        LocalDate now = LocalDate.now();
        String dailyPeriodId = now.format(DateTimeFormatter.ISO_LOCAL_DATE);

        WeekFields weekFields = WeekFields.of(Locale.getDefault());
        int weekNumber = now.get(weekFields.weekOfWeekBasedYear());
        String weeklyPeriodId = now.getYear() + "-W" + weekNumber;

        Set<String> claimedCodes = new HashSet<>();
        questClaimRepository.findAllByUserIdAndPeriodId(userId, dailyPeriodId)
                .forEach(c -> claimedCodes.add(c.getQuestCode()));
        questClaimRepository.findAllByUserIdAndPeriodId(userId, weeklyPeriodId)
                .forEach(c -> claimedCodes.add(c.getQuestCode()));

        List<Quest> allQuests = questRepository.findAll();

        return allQuests.stream().map(quest -> {
            boolean isDaily = "DAILY".equals(quest.getType());
            boolean claimed = claimedCodes.contains(quest.getCode());
            int currentProgress = calculateProgress(userId, quest, isDaily);

            return QuestDTO.builder()
                    .id(quest.getId())
                    .code(quest.getCode())
                    .title(quest.getTitle())
                    .description(quest.getDescription())
                    .rewardXp(quest.getRewardXp())
                    .rewardAxons(quest.getRewardAxons())
                    .type(quest.getType())
                    .goalValue(quest.getGoalValue())
                    .currentValue(Math.min(currentProgress, quest.getGoalValue()))
                    .status(claimed ? "CLAIMED" : (currentProgress >= quest.getGoalValue() ? "COMPLETED" : "IN_PROGRESS"))
                    .build();
        }).collect(Collectors.toList());
    }

    private int calculateProgress(UUID userId, Quest quest, boolean isDaily) {
        String timeCondition = isDaily ? ">= CURRENT_DATE" : ">= (CURRENT_DATE - INTERVAL '7 days')";

        switch (quest.getGoalType()) {
            case "QUESTIONS":
                String sqlQuestions = "SELECT " +
                        "(SELECT COUNT(*) FROM student.attempts WHERE user_id = ? AND created_at " + timeCondition + ") + " +
                        "(SELECT COUNT(*) FROM student.activity_attempts a WHERE a.user_id = ? AND a.status = 'COMPLETED' AND a.finished_at " + timeCondition + ")";
                return jdbcTemplate.queryForObject(sqlQuestions, Integer.class, userId, userId);

            case "WIN":
                String sqlWin = "SELECT COUNT(*) FROM student.duels WHERE winner_id = ? AND status = 'COMPLETED' AND updated_at " + timeCondition;
                return jdbcTemplate.queryForObject(sqlWin, Integer.class, userId);

            case "SIMULADO":
                // Count completed simulado sessions in this period
                String sqlSimulado = "SELECT COUNT(*) FROM student.simulado_sessions " +
                        "WHERE user_id = ? AND status = 'COMPLETED' AND submitted_at " + timeCondition;
                Integer sessionCount = jdbcTemplate.queryForObject(sqlSimulado, Integer.class, userId);
                if (sessionCount != null && sessionCount > 0) return sessionCount;
                // Fallback: also check simulado_results table (older completion path)
                String sqlSimuladoResults = "SELECT COUNT(*) FROM student.simulado_results " +
                        "WHERE user_id = ? AND completed_at " + timeCondition;
                Integer resultsCount = jdbcTemplate.queryForObject(sqlSimuladoResults, Integer.class, userId);
                return resultsCount != null ? resultsCount : 0;

            case "STREAK":
                // Count consecutive correct answers from most recent, stopping at first wrong
                return jdbcTemplate.queryForObject("""
                        WITH attempts_period AS (
                            SELECT is_correct,
                                   ROW_NUMBER() OVER (ORDER BY created_at DESC) AS rn
                            FROM student.attempts
                            WHERE user_id = ? AND created_at >= CURRENT_DATE
                        ),
                        first_wrong AS (
                            SELECT COALESCE(MIN(rn), 999999) AS pos
                            FROM attempts_period
                            WHERE is_correct = false
                        )
                        SELECT COUNT(*)
                        FROM attempts_period, first_wrong
                        WHERE attempts_period.rn < first_wrong.pos
                          AND attempts_period.is_correct = true
                        """, Integer.class, userId);

            default:
                return 0;
        }
    }

    @Transactional
    public ClaimResultDTO claimQuest(UUID userId, String questCode) {
        Quest quest = questRepository.findByCode(questCode)
                .orElseThrow(() -> new RuntimeException("Quest not found: " + questCode));

        LocalDate now = LocalDate.now();
        WeekFields weekFields = WeekFields.of(Locale.getDefault());
        String periodId = "DAILY".equals(quest.getType())
                ? now.format(DateTimeFormatter.ISO_LOCAL_DATE)
                : now.getYear() + "-W" + now.get(weekFields.weekOfWeekBasedYear());

        if (questClaimRepository.existsByUserIdAndQuestCodeAndPeriodId(userId, questCode, periodId)) {
            throw new RuntimeException("Recompensa já resgatada.");
        }

        int currentProgress = calculateProgress(userId, quest, "DAILY".equals(quest.getType()));
        if (currentProgress < quest.getGoalValue()) {
            throw new RuntimeException("Objetivo ainda não alcançado.");
        }

        questClaimRepository.save(QuestClaim.builder()
                .userId(userId)
                .questCode(questCode)
                .periodId(periodId)
                .build());

        // Award XP — addXp also auto-adds axons equal to XP gained
        RewardDTO reward = gamificationService.addXp(userId, quest.getRewardXp());

        // Correct axon amount: addXp awarded axons = xpGained, but quest specifies rewardAxons
        int axonDelta = quest.getRewardAxons() - reward.getXpGained();
        if (axonDelta != 0) {
            gamificationService.adjustAxonCoins(userId, axonDelta);
        }

        log.info("Quest {} claimed by {}: +{}XP +{}Axons", questCode, userId, reward.getXpGained(), quest.getRewardAxons());

        return ClaimResultDTO.builder()
                .xpGained(reward.getXpGained())
                .axonsGained(quest.getRewardAxons())
                .totalXp(reward.getTotalXp())
                .currentLevel(reward.getCurrentLevel())
                .leveledUp(reward.isLeveledUp())
                .build();
    }

    @lombok.Data
    @lombok.Builder
    public static class QuestDTO {
        private UUID id;
        private String code;
        private String title;
        private String description;
        private int rewardXp;
        private int rewardAxons;
        private String type;
        private int goalValue;
        private int currentValue;
        private String status;
    }

    @lombok.Data
    @lombok.Builder
    public static class ClaimResultDTO {
        private int xpGained;
        private int axonsGained;
        private int totalXp;
        private int currentLevel;
        private boolean leveledUp;
    }
}
