package com.bizu.portal.content.api;

import com.bizu.portal.content.application.AdminSimuladoService;
import com.bizu.portal.content.domain.Question;
import com.bizu.portal.content.domain.Simulado;
import com.bizu.portal.shared.pagination.PageResponse;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/simulados")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminSimuladoController {

    private final AdminSimuladoService adminSimuladoService;

    @GetMapping
    public ResponseEntity<PageResponse<Simulado>> listSimulados(
            @PageableDefault(size = 20) Pageable pageable) {
        return ResponseEntity.ok(PageResponse.of(adminSimuladoService.findAll(pageable)));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Simulado> getSimulado(@PathVariable UUID id) {
        return ResponseEntity.ok(adminSimuladoService.findById(id));
    }

    @Data
    public static class SimuladoRequest {
        private String title;
        private String description;
        private OffsetDateTime startDate;
        private OffsetDateTime endDate;
        private UUID courseId;
    }

    @PostMapping
    public ResponseEntity<Simulado> createSimulado(@RequestBody SimuladoRequest request) {
        Simulado simulado = new Simulado();
        simulado.setTitle(request.getTitle());
        simulado.setDescription(request.getDescription());
        simulado.setStartDate(request.getStartDate());
        simulado.setEndDate(request.getEndDate());
        return ResponseEntity.ok(adminSimuladoService.createSimulado(simulado, request.getCourseId()));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Simulado> updateSimulado(@PathVariable UUID id, @RequestBody SimuladoRequest request) {
        Simulado simulado = new Simulado();
        simulado.setTitle(request.getTitle());
        simulado.setDescription(request.getDescription());
        simulado.setStartDate(request.getStartDate());
        simulado.setEndDate(request.getEndDate());
        return ResponseEntity.ok(adminSimuladoService.updateSimulado(id, simulado, request.getCourseId()));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteSimulado(@PathVariable UUID id) {
        adminSimuladoService.deleteSimulado(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/questions")
    public ResponseEntity<Simulado> addQuestion(@PathVariable UUID id, @RequestBody Question question) {
        return ResponseEntity.ok(adminSimuladoService.addQuestion(id, question));
    }

    @DeleteMapping("/{id}/questions/{questionId}")
    public ResponseEntity<Simulado> removeQuestion(@PathVariable UUID id, @PathVariable UUID questionId) {
        return ResponseEntity.ok(adminSimuladoService.removeQuestion(id, questionId));
    }
}
