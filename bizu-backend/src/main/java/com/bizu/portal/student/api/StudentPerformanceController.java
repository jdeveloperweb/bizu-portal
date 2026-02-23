package com.bizu.portal.student.api;

import com.bizu.portal.student.application.SubjectStatsDTO;
import com.bizu.portal.student.infrastructure.AttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/student/performance")
@RequiredArgsConstructor
public class StudentPerformanceController {

    private final AttemptRepository attemptRepository;

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getPerformanceSummary(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        
        // In a real app, this would be a custom JPQL query for better performance
        var allAttempts = attemptRepository.findAllByUserId(userId);
        
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

        Map<String, Object> response = new HashMap<>();
        response.put("totalAttempted", allAttempts.size());
        response.put("overallAccuracy", allAttempts.isEmpty() ? 0 : 
            (double) allAttempts.stream().filter(com.bizu.portal.student.domain.Attempt::isCorrect).count() / allAttempts.size() * 100);
        response.put("bySubject", stats);

        return ResponseEntity.ok(response);
    }
}
