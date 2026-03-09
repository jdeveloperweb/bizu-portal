package com.bizu.portal.student.api;

import com.bizu.portal.content.application.CourseService;
import com.bizu.portal.content.application.ModuleService;
import com.bizu.portal.content.domain.Course;
import com.bizu.portal.content.domain.Module;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.UserRepository;
import com.bizu.portal.shared.security.CourseContextGuard;
import com.bizu.portal.shared.security.CourseContextHolder;
import com.bizu.portal.student.application.ActivityService;
import com.bizu.portal.student.domain.ActivityAttempt;
import com.bizu.portal.student.domain.ActivityAttemptItemSnapshot;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/activities")
@RequiredArgsConstructor
@CourseContextGuard
public class StudentActivityController {

    private final ActivityService activityService;
    private final CourseService courseService;
    private final ModuleService moduleService;
    private final UserRepository userRepository;
    private final com.bizu.portal.student.application.AttemptService attemptService;
    private final com.bizu.portal.content.infrastructure.QuestionRepository questionRepository;

    @Data
    public static class StartExamRequest {
        private UUID simuladoId;
    }

    @Data
    public static class StartQuizRequest {
        private UUID moduleId;
        private int questionCount = 10;
    }

    @Data
    public static class SubmitAnswerRequest {
        private UUID snapshotId;
        private String selectedOption;
    }

    @Data
    public static class QuickAnswerRequest {
        private UUID questionId;
        private String selectedOption;
    }

    @PostMapping("/exam/start")
    public ResponseEntity<ActivityAttempt> startExam(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody StartExamRequest request) {
        User user = resolveUser(jwt);
        Course course = courseService.findById(CourseContextHolder.requireCourseId());
        ActivityAttempt attempt = activityService.startOfficialExam(user, course, request.getSimuladoId());
        return ResponseEntity.ok(attempt);
    }

    @PostMapping("/quiz/start")
    public ResponseEntity<ActivityAttempt> startQuiz(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody StartQuizRequest request) {
        User user = resolveUser(jwt);
        Course course = courseService.findById(CourseContextHolder.requireCourseId());
        Module module = moduleService.findById(request.getModuleId());
        ActivityAttempt attempt = activityService.startModuleQuiz(
            user, course, module, request.getQuestionCount());
        return ResponseEntity.ok(attempt);
    }

    @PostMapping("/{attemptId}/answer")
    public ResponseEntity<ActivityAttemptItemSnapshot> submitAnswer(
            @PathVariable UUID attemptId,
            @RequestBody SubmitAnswerRequest request) {
        ActivityAttemptItemSnapshot snapshot = activityService.submitAnswer(
            attemptId, request.getSnapshotId(), request.getSelectedOption());
        return ResponseEntity.ok(snapshot);
    }

    @PostMapping("/{attemptId}/finish")
    public ResponseEntity<com.bizu.portal.student.application.RewardDTO> finishAttempt(@PathVariable UUID attemptId) {
        return ResponseEntity.ok(activityService.finishAttempt(attemptId));
    }

    @PostMapping("/quick-answer")
    public ResponseEntity<com.bizu.portal.student.application.RewardDTO> submitQuickAnswer(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody QuickAnswerRequest request) {
        User user = resolveUser(jwt);
        com.bizu.portal.content.domain.Question question = questionRepository.findById(request.getQuestionId())
            .orElseThrow(() -> new RuntimeException("Questão não encontrada"));
        
        com.bizu.portal.student.domain.Attempt attempt = attemptService.processAttempt(user, question, request.getSelectedOption());
        
        // Retornar um RewardDTO genérico ou null se quisermos apenas Ok
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{attemptId}")
    public ResponseEntity<ActivityAttempt> getAttempt(@PathVariable UUID attemptId) {
        return ResponseEntity.ok(activityService.getAttempt(attemptId));
    }

    private User resolveUser(Jwt jwt) {
        String email = jwt.getClaim("email");
        return userRepository.findByEmail(email)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }
}
