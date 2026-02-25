package com.bizu.portal.student.api;

import com.bizu.portal.student.application.SubjectStatsDTO;
import com.bizu.portal.student.infrastructure.AttemptRepository;
import com.bizu.portal.identity.application.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
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

    private final AttemptRepository attemptRepository;
    private final UserService userService;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getPerformanceSummary(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        
        var allAttempts = attemptRepository.findAllByUser_Id(userId);
        
        // Stats by Subject
        Map<String, List<com.bizu.portal.student.domain.Attempt>> bySubject = allAttempts.stream()
            .collect(Collectors.groupingBy(a -> a.getQuestion().getSubject()));

        List<SubjectStatsDTO> stats = bySubject.entrySet().stream()
            .map(entry -> {
                long total = entry.getValue().size();
                long correct = entry.getValue().stream().filter(com.bizu.portal.student.domain.Attempt::isCorrect).count();
                return SubjectStatsDTO.builder()
                    .subject(entry.getKey())
                    .totalQuestions(total)
                    .correctAnswers(correct)
                    .accuracy(total > 0 ? (double) correct / total * 100 : 0)
                    .build();
            })
            .sorted(Comparator.comparingDouble(SubjectStatsDTO::getAccuracy).reversed())
            .toList();

        // Weekly Activity (Last 7 days)
        OffsetDateTime now = OffsetDateTime.now();
        Map<String, List<com.bizu.portal.student.domain.Attempt>> byDay = allAttempts.stream()
            .filter(a -> a.getCreatedAt().isAfter(now.minusDays(7)))
            .collect(Collectors.groupingBy(a -> a.getCreatedAt().getDayOfWeek().toString()));

        // Study Time (Total and Weekly)
        long totalSeconds = allAttempts.stream()
            .mapToLong(a -> a.getTimeSpentSeconds() != null ? a.getTimeSpentSeconds() : 0)
            .sum();
            
        long weeklySeconds = allAttempts.stream()
            .filter(a -> a.getCreatedAt().isAfter(now.minusDays(7)))
            .mapToLong(a -> a.getTimeSpentSeconds() != null ? a.getTimeSpentSeconds() : 0)
            .sum();

        Map<String, Object> response = new HashMap<>();
        response.put("totalAttempted", allAttempts.size());
        response.put("overallAccuracy", allAttempts.isEmpty() ? 0 : 
            (double) allAttempts.stream().filter(com.bizu.portal.student.domain.Attempt::isCorrect).count() / allAttempts.size() * 100);
        response.put("totalTimeSpentSeconds", totalSeconds);
        response.put("weeklyTimeSpentSeconds", weeklySeconds);
        response.put("bySubject", stats);
        
        // Format weekly data for frontend
        List<Map<String, Object>> weeklyData = new ArrayList<>();
        String[] days = {"MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY", "SUNDAY"};
        for (String day : days) {
            List<com.bizu.portal.student.domain.Attempt> dayAttempts = byDay.getOrDefault(day, Collections.emptyList());
            Map<String, Object> dayMap = new HashMap<>();
            dayMap.put("day", day);
            dayMap.put("questions", dayAttempts.size());
            dayMap.put("accuracy", dayAttempts.isEmpty() ? 0 : 
                (double) dayAttempts.stream().filter(com.bizu.portal.student.domain.Attempt::isCorrect).count() / dayAttempts.size() * 100);
            weeklyData.add(dayMap);
        }
        response.put("weeklyData", weeklyData);

        return ResponseEntity.ok(response);
    }
}
