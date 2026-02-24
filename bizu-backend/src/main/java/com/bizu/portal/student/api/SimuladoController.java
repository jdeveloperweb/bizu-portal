package com.bizu.portal.student.api;

import com.bizu.portal.content.domain.Simulado;
import com.bizu.portal.content.infrastructure.SimuladoRepository;
import com.bizu.portal.student.application.StudentSimuladoService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/simulados")
@RequiredArgsConstructor
public class SimuladoController {

    private final SimuladoRepository simuladoRepository;
    private final StudentSimuladoService studentSimuladoService;

    @GetMapping("/disponiveis")
    public ResponseEntity<List<Simulado>> getAvailableSimulados() {
        return ResponseEntity.ok(simuladoRepository.findAll());
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
