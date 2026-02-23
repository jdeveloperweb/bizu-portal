package com.bizu.portal.content.api;

import com.bizu.portal.content.application.MaterialService;
import com.bizu.portal.content.domain.Material;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/materials")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminMaterialController {

    private final MaterialService materialService;

    @PostMapping
    public ResponseEntity<Material> createMaterial(@RequestBody Material material) {
        return ResponseEntity.ok(materialService.save(material));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Material> updateMaterial(@PathVariable UUID id, @RequestBody Material material) {
        Material existing = materialService.findById(id);
        material.setId(existing.getId());
        return ResponseEntity.ok(materialService.save(material));
    }

    @GetMapping("/module/{moduleId}")
    public ResponseEntity<List<Material>> getMaterialsByModule(@PathVariable UUID moduleId) {
        return ResponseEntity.ok(materialService.findByModuleId(moduleId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable UUID id) {
        materialService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
