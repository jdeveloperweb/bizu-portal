package com.bizu.portal.content.api;

import com.bizu.portal.content.application.MaterialService;
import com.bizu.portal.content.application.QuestionGenerationService;
import com.bizu.portal.content.domain.Material;
import lombok.RequiredArgsConstructor;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import jakarta.servlet.http.HttpServletResponse;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.CompletableFuture;

@RestController
@RequestMapping("/api/v1/admin/materials")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminMaterialController {

    private final MaterialService materialService;
    private final QuestionGenerationService questionGenerationService;

    @PostMapping
    public ResponseEntity<Material> createMaterial(@RequestBody Material material) {
        return ResponseEntity.ok(materialService.save(material));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Material> updateMaterial(@PathVariable UUID id, @RequestBody Material material) {
        Material existing = materialService.findById(id);
        existing.setTitle(material.getTitle());
        existing.setDescription(material.getDescription());
        existing.setFileUrl(material.getFileUrl());
        existing.setFileType(material.getFileType());
        existing.setFree(material.isFree());
        existing.setContent(material.getContent());
        existing.setDurationMinutes(material.getDurationMinutes());
        return ResponseEntity.ok(materialService.save(existing));
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

    // ── AI Question Generation ────────────────────────────────────────────────

    @GetMapping(value = "/{materialId}/generate-questions", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter generateQuestions(
            @PathVariable UUID materialId,
            @RequestParam int perChunk,
            @RequestParam String category,
            @RequestParam UUID moduleId,
            @RequestParam(required = false, defaultValue = "Módulo") String moduleName,
            HttpServletResponse response) {

        // Disable nginx/proxy buffering so events stream in real-time
        response.setHeader("X-Accel-Buffering", "no");
        response.setHeader("Cache-Control", "no-cache, no-transform");
        response.setHeader("Connection", "keep-alive");

        Material material = materialService.findById(materialId);
        String content = material.getContent();
        String title = material.getTitle();

        SseEmitter emitter = new SseEmitter(600_000L); // 10-minute timeout for large articles

        CompletableFuture.runAsync(() ->
                questionGenerationService.generate(content, title, moduleId, moduleName, perChunk, category, emitter));

        return emitter;
    }
}
