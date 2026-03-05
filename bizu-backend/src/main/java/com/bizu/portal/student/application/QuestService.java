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

        Map<String, Boolean> claimedMap = questClaimRepository.findAllByUserIdAndPeriodId(userId, dailyPeriodId).stream()
                .collect(Collectors.toMap(QuestClaim::getQuestCode, q -> true));
        claimedMap.putAll(questClaimRepository.findAllByUserIdAndPeriodId(userId, weeklyPeriodId).stream()
                .collect(Collectors.toMap(QuestClaim::getQuestCode, q -> true)));

        List<Quest> allQuests = questRepository.findAll();
        
        return allQuests.stream().map(quest -> {
            boolean isDaily = "DAILY".equals(quest.getType());
            String periodId = isDaily ? dailyPeriodId : weeklyPeriodId;
            boolean claimed = claimedMap.getOrDefault(quest.getCode(), false);
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
            case "STREAK":
                // Consecutive correct answers today
                return jdbcTemplate.queryForObject("""
                    WITH last_attempts AS (
                        SELECT is_correct FROM student.attempts 
                        WHERE user_id = ? AND created_at >= CURRENT_DATE 
                        ORDER BY created_at DESC
                    )
                    SELECT COUNT(*) FROM last_attempts WHERE is_correct = true
                    """, Integer.class, userId);
            default:
                return 0;
        }
    }

    @Transactional
    public void claimQuest(UUID userId, String questCode) {
        Quest quest = questRepository.findAll().stream()
                .filter(q -> q.getCode().equals(questCode))
                .findFirst()
                .orElseThrow(() -> new RuntimeException("Quest not found"));

        LocalDate now = LocalDate.now();
        String periodId = "DAILY".equals(quest.getType()) ? 
                now.format(DateTimeFormatter.ISO_LOCAL_DATE) : 
                now.getYear() + "-W" + now.get(WeekFields.of(Locale.getDefault()).weekOfWeekBasedYear());

        if (questClaimRepository.existsByUserIdAndQuestCodeAndPeriodId(userId, questCode, periodId)) {
            throw new RuntimeException("Recompensa já resgatada.");
        }

        int currentProgress = calculateProgress(userId, quest, "DAILY".equals(quest.getType()));
        if (currentProgress < quest.getGoalValue()) {
            throw new RuntimeException("Objetivo ainda não alcançado.");
        }

        QuestClaim claim = QuestClaim.builder()
                .userId(userId)
                .questCode(questCode)
                .periodId(periodId)
                .build();
        questClaimRepository.save(claim);

        // Award rewards
        gamificationService.addXp(userId, quest.getRewardXp());
        // Note: gamificationService.addXp also adds Axons currently in some versions, 
        // but here we might want to ensure axons are added explicitly if needed.
        // Looking at GamificationService.java: stats.setAxonCoins(stats.getAxonCoins() + finalChange)
        // Since we add XP, it will also add Axons.
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
}
