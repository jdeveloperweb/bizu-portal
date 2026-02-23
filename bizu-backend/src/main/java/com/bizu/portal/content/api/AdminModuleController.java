package com.bizu.portal.content.api;

import com.bizu.portal.content.application.ModuleService;
import com.bizu.portal.content.domain.Module;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/modules")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminModuleController {

    private final ModuleService moduleService;

    @PostMapping
    public ResponseEntity<Module> createModule(@RequestBody Module module) {
        return ResponseEntity.ok(moduleService.save(module));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Module> updateModule(@PathVariable UUID id, @RequestBody Module module) {
        Module existing = moduleService.findById(id);
        module.setId(existing.getId());
        return ResponseEntity.ok(moduleService.save(module));
    }

    @GetMapping("/course/{courseId}")
    public ResponseEntity<List<Module>> getModulesByCourse(@PathVariable UUID courseId) {
        return ResponseEntity.ok(moduleService.findByCourseId(courseId));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteModule(@PathVariable UUID id) {
        moduleService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
