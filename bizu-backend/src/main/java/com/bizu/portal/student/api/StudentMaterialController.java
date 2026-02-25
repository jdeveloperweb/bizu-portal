package com.bizu.portal.student.api;

import com.bizu.portal.content.application.MaterialService;
import com.bizu.portal.content.domain.Material;
import com.bizu.portal.content.infrastructure.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/materials")
@RequiredArgsConstructor
public class StudentMaterialController {

    private final MaterialService materialService;
    private final MaterialRepository materialRepository;

    @GetMapping
    public ResponseEntity<List<Material>> getAllMaterials() {
        // Encontra todos os materiais ativos para o aluno
        return ResponseEntity.ok(materialRepository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Material> getMaterialById(@PathVariable UUID id) {
        return ResponseEntity.ok(materialService.findById(id));
    }

    @GetMapping("/module/{moduleId}")
    public ResponseEntity<List<Material>> getMaterialsByModule(@PathVariable UUID moduleId) {
        return ResponseEntity.ok(materialService.findByModuleId(moduleId));
    }
}
