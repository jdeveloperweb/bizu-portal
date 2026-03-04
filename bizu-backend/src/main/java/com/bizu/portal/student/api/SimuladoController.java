package com.bizu.portal.student.api;

import com.bizu.portal.commerce.application.EntitlementService;
import com.bizu.portal.content.domain.Simulado;
import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.student.application.SimuladoExamService;
import com.bizu.portal.student.application.SimuladoExamService.ExamResultDTO;
import com.bizu.portal.student.application.SimuladoExamService.SessionStartDTO;
import com.bizu.portal.student.application.SimuladoExamService.SimuladoListItemDTO;
import com.bizu.portal.student.application.StudentSimuladoService;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/simulados")
@RequiredArgsConstructor
public class SimuladoController {

    private final StudentSimuladoService studentSimuladoService;
    private final SimuladoExamService simuladoExamService;
    private final EntitlementService entitlementService;
    private final UserService userService;

    // ─────────────────────────────────────────────────────────────────────
    // List available simulados with user-specific status
    // ─────────────────────────────────────────────────────────────────────

    @GetMapping("/disponiveis")
    public ResponseEntity<List<SimuladoListItemDTO>> getAvailableSimulados(
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);

        List<UUID> activeCourseIds = entitlementService.getActiveEntitlements(userId)
                .stream()
                .map(e -> e.getCourse().getId())
                .collect(Collectors.toList());

        return ResponseEntity.ok(simuladoExamService.getAvailableSimuladoList(userId, activeCourseIds));
    }

    // ─────────────────────────────────────────────────────────────────────
    // Start Exam Session
    // ─────────────────────────────────────────────────────────────────────

    @PostMapping("/{id}/iniciar")
    public ResponseEntity<SessionStartDTO> startExam(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(simuladoExamService.startExam(userId, id));
    }

    // ─────────────────────────────────────────────────────────────────────
    // Submit Exam Answers
    // ─────────────────────────────────────────────────────────────────────

    @Data
    public static class SubmitRequest {
        private Map<String, String> answers;
    }

    @PostMapping("/{id}/submeter")
    public ResponseEntity<ExamResultDTO> submitExam(
            @PathVariable UUID id,
            @RequestBody SubmitRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(simuladoExamService.submitExam(userId, id,
                request.getAnswers() != null ? request.getAnswers() : Map.of()));
    }

    // ─────────────────────────────────────────────────────────────────────
    // Cancel Exam (anti-cheat: user left the page)
    // ─────────────────────────────────────────────────────────────────────

    @PostMapping("/{id}/cancelar")
    public ResponseEntity<Void> cancelExam(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        simuladoExamService.cancelExam(userId, id);
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────────────────────────────
    // Get my result for a specific simulado
    // ─────────────────────────────────────────────────────────────────────

    @GetMapping("/{id}/meu-resultado")
    public ResponseEntity<ExamResultDTO> getMyResult(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(simuladoExamService.getMyResult(userId, id));
    }

    // ─────────────────────────────────────────────────────────────────────
    // Practice Exam (refazer) — no ranking impact
    // ─────────────────────────────────────────────────────────────────────

    @PostMapping("/{id}/refazer/iniciar")
    public ResponseEntity<SessionStartDTO> startPracticeExam(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(simuladoExamService.startPracticeExam(userId, id));
    }

    @PostMapping("/{id}/refazer/submeter")
    public ResponseEntity<ExamResultDTO> submitPracticeExam(
            @PathVariable UUID id,
            @RequestParam UUID sessionId,
            @RequestBody SubmitRequest request,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(simuladoExamService.submitPracticeExam(
                userId, id, sessionId,
                request.getAnswers() != null ? request.getAnswers() : Map.of()));
    }

    @PostMapping("/{id}/refazer/cancelar")
    public ResponseEntity<Void> cancelPracticeExam(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        simuladoExamService.cancelPracticeExam(userId, id);
        return ResponseEntity.noContent().build();
    }

    // ─────────────────────────────────────────────────────────────────────
    // Legacy endpoints (quick quiz, custom simulado)
    // ─────────────────────────────────────────────────────────────────────

    @GetMapping("/quiz/rapido")
    public ResponseEntity<Simulado> getQuickQuiz(
            @RequestParam(defaultValue = "10") int count,
            @RequestParam(required = false) List<UUID> moduleIds) {
        return ResponseEntity.ok(studentSimuladoService.generateQuickQuiz(count, moduleIds));
    }

    @PostMapping("/personalizado")
    public ResponseEntity<Simulado> createCustomSimulado(
            @RequestParam List<UUID> moduleIds,
            @RequestParam int count,
            @RequestParam String difficulty) {
        return ResponseEntity.ok(studentSimuladoService.generateQuickQuiz(count, moduleIds));
    }
}
