package com.bizu.portal.student.api;

import com.bizu.portal.commerce.application.EntitlementService;
import com.bizu.portal.content.domain.Simulado;
import com.bizu.portal.content.infrastructure.SimuladoRepository;
import com.bizu.portal.student.application.StudentSimuladoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/simulados")
@RequiredArgsConstructor
public class SimuladoController {

    private final SimuladoRepository simuladoRepository;
    private final StudentSimuladoService studentSimuladoService;
    private final EntitlementService entitlementService;

    @GetMapping("/disponiveis")
    public ResponseEntity<List<Simulado>> getAvailableSimulados(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        
        // Get active course IDs for the user
        List<UUID> activeCourseIds = entitlementService.getActiveEntitlements(userId)
            .stream()
            .map(e -> e.getCourse().getId())
            .collect(Collectors.toList());
            
        if (activeCourseIds.isEmpty()) {
            return ResponseEntity.ok(simuladoRepository.findAllByCourseIsNull());
        }

        List<Simulado> simulados = simuladoRepository.findAllByCourseIdIn(activeCourseIds);
        // Also include national simulados (those without a specific course)
        simulados.addAll(simuladoRepository.findAllByCourseIsNull());
        
        return ResponseEntity.ok(simulados);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Simulado> getSimulado(@PathVariable UUID id) {
        return ResponseEntity.ok(studentSimuladoService.getSimuladoCompleto(id));
    }

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
