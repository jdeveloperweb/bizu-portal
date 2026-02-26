package com.bizu.portal.student.api;

import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.student.application.SubjectStatsDTO;
import lombok.Builder;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/student/performance")
@RequiredArgsConstructor
public class StudentPerformanceController {

    private final UserService userService;
    private final JdbcTemplate jdbcTemplate;

    @Data
    @Builder
    public static class PerformanceSummaryResponse {
        private long totalAttempted;
        private double overallAccuracy;
        private long totalTimeSpentSeconds;
        private long weeklyTimeSpentSeconds;
        private List<SubjectStatsDTO> bySubject;
        private List<Map<String, Object>> weeklyData;
        private Object ranking;
        private List<String> suggestions;
    }

    @GetMapping("/summary")
    public ResponseEntity<PerformanceSummaryResponse> getPerformanceSummary(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);

        // Unified Query to get ALL attempts from ALL sources
        String unifiedQuery = """
            WITH all_attempts AS (
                -- Single attempts (training/pomodoro)
                SELECT a.id, a.created_at, a.is_correct, COALESCE(a.time_spent_seconds, 0) as time_spent, q.subject, q.difficulty
                FROM student.attempts a
                JOIN content.questions q ON a.question_id = q.id
                WHERE a.user_id = ?
                
                UNION ALL
                
                -- Activity snapshots (quizzes/simulados)
                SELECT s.id, COALESCE(s.answered_at, aa.created_at) as created_at, s.student_correct as is_correct, COALESCE(s.time_spent_seconds, 0) as time_spent, s.snapshot_subject as subject, s.snapshot_difficulty as difficulty
                FROM student.activity_attempt_item_snapshots s
                JOIN student.activity_attempts aa ON s.attempt_id = aa.id
                WHERE aa.user_id = ? AND s.student_selected_option IS NOT NULL
                
                UNION ALL
                
                -- Duels (Arena) - Challenger
                SELECT dq.id, dq.created_at, dq.challenger_correct as is_correct, 30 as time_spent, q.subject, dq.difficulty
                FROM student.duel_questions dq
                JOIN student.duels d ON dq.duel_id = d.id
                JOIN content.questions q ON dq.question_id = q.id
                WHERE d.challenger_id = ? AND dq.challenger_answer_index IS NOT NULL
                
                UNION ALL
                
                -- Duels (Arena) - Opponent
                SELECT dq.id, dq.created_at, dq.opponent_correct as is_correct, 30 as time_spent, q.subject, dq.difficulty
                FROM student.duel_questions dq
                JOIN student.duels d ON dq.duel_id = d.id
                JOIN content.questions q ON dq.question_id = q.id
                WHERE d.opponent_id = ? AND dq.opponent_answer_index IS NOT NULL
            )
            SELECT * FROM all_attempts ORDER BY created_at DESC
            """;

        List<Map<String, Object>> rows = jdbcTemplate.queryForList(unifiedQuery, userId, userId, userId, userId);

        long totalAttempted = rows.size();
        long correctCount = rows.stream().filter(r -> Boolean.TRUE.equals(r.get("is_correct"))).count();
        double overallAccuracy = totalAttempted > 0 ? (double) correctCount / totalAttempted * 100 : 0;
        long totalTimeSeconds = rows.stream().mapToLong(r -> ((Number) r.get("time_spent")).longValue()).sum();

        // Weekly Activity (Last 7 days)
        OffsetDateTime sevenDaysAgo = OffsetDateTime.now().minusDays(7);
        List<Map<String, Object>> weeklyRows = rows.stream()
            .filter(r -> {
                Object createdAt = r.get("created_at");
                if (createdAt instanceof OffsetDateTime odt) return odt.isAfter(sevenDaysAgo);
                if (createdAt instanceof java.sql.Timestamp ts) return ts.toInstant().isAfter(sevenDaysAgo.toInstant());
                return false;
            })
            .toList();

        long weeklyTimeSeconds = weeklyRows.stream().mapToLong(r -> ((Number) r.get("time_spent")).longValue()).sum();

        // Group by Subject
        Map<String, List<Map<String, Object>>> bySubject = rows.stream()
            .collect(Collectors.groupingBy(r -> String.valueOf(r.get("subject") != null ? r.get("subject") : "Geral")));

        List<SubjectStatsDTO> stats = bySubject.entrySet().stream()
            .map(entry -> {
                long total = entry.getValue().size();
                long correct = entry.getValue().stream().filter(r -> Boolean.TRUE.equals(r.get("is_correct"))).count();
                return SubjectStatsDTO.builder()
                    .subject(entry.getKey())
                    .totalQuestions(total)
                    .correctAnswers(correct)
                    .accuracy(total > 0 ? (double) correct / total * 100 : 0)
                    .build();
            })
            .sorted(Comparator.comparingDouble(SubjectStatsDTO::getAccuracy).reversed())
            .toList();

        // Format weekly data for chart
        List<Map<String, Object>> weeklyData = new ArrayList<>();
        String[] days = {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"};
        Map<String, List<Map<String, Object>>> byDay = weeklyRows.stream()
            .collect(Collectors.groupingBy(r -> {
                Object createdAt = r.get("created_at");
                if (createdAt instanceof OffsetDateTime odt) return odt.getDayOfWeek().toString();
                if (createdAt instanceof java.sql.Timestamp ts) return ts.toLocalDateTime().getDayOfWeek().toString();
                return "UNKNOWN";
            }));

        for (String day : days) {
            List<Map<String, Object>> dayAttempts = byDay.getOrDefault(day, Collections.emptyList());
            Map<String, Object> dayMap = new HashMap<>();
            dayMap.put("day", day);
            dayMap.put("questions", dayAttempts.size());
            dayMap.put("accuracy", dayAttempts.isEmpty() ? 0 : 
                (double) dayAttempts.stream().filter(r -> Boolean.TRUE.equals(r.get("is_correct"))).count() / dayAttempts.size() * 100);
            weeklyData.add(dayMap);
        }

        // Get Ranking
        Long rank = jdbcTemplate.queryForObject(
            "SELECT (COUNT(*) + 1) FROM student.gamification_stats WHERE total_xp > (SELECT COALESCE(total_xp, 0) FROM student.gamification_stats WHERE user_id = ?)",
            Long.class, userId
        );

        // AI Suggestions (Weakest subjects)
        List<String> suggestions = stats.stream()
            .filter(s -> s.getAccuracy() < 70)
            .sorted(Comparator.comparingDouble(SubjectStatsDTO::getAccuracy))
            .limit(3)
            .map(s -> "Focar em " + s.getSubject())
            .collect(Collectors.toList());
            
        if (suggestions.isEmpty() && !stats.isEmpty()) {
            suggestions.add("Continuar praticando seus pontos fortes");
        } else if (suggestions.isEmpty()) {
            suggestions.add("Inicie seus estudos para receber sugestões");
        }

        return ResponseEntity.ok(PerformanceSummaryResponse.builder()
            .totalAttempted(totalAttempted)
            .overallAccuracy(overallAccuracy)
            .totalTimeSpentSeconds(totalTimeSeconds)
            .weeklyTimeSpentSeconds(weeklyTimeSeconds)
            .bySubject(stats)
            .weeklyData(weeklyData)
            .ranking(rank != null ? "#" + rank : "#--")
            .suggestions(suggestions)
            .build());
    }
}

