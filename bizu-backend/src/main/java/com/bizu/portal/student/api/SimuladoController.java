package com.bizu.portal.student.api;

import com.bizu.portal.content.domain.Simulado;
import com.bizu.portal.content.infrastructure.QuestionRepository;
import com.bizu.portal.content.infrastructure.SimuladoRepository;
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
    private final QuestionRepository questionRepository;

    @GetMapping("/disponiveis")
    public ResponseEntity<List<Simulado>> getAvailableSimulados() {
        // Here we could filter by current date
        return ResponseEntity.ok(simuladoRepository.findAll());
    }

    @PostMapping("/personalizado")
    public ResponseEntity<Simulado> createCustomSimulado(
            @RequestParam List<String> subjects,
            @RequestParam int count,
            @RequestParam String difficulty) {
        
        // Logic to fetch custom questions and return a temporary "simulado" session
        // For now, returning a mock or finding existing questions
        return ResponseEntity.ok(Simulado.builder()
            .title("Simulado Personalizado")
            .description("Gerado conforme seus critérios")
            .build());
    }
}
