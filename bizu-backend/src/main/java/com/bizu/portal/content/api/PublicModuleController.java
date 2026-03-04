package com.bizu.portal.content.api;

import com.bizu.portal.content.api.dto.PublicModuleDTO;
import com.bizu.portal.content.application.ModuleService;
import com.bizu.portal.content.domain.Module;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public/modules")
@RequiredArgsConstructor
public class PublicModuleController {

    private final ModuleService moduleService;

    @GetMapping("/{id}")
    public ResponseEntity<PublicModuleDTO> getModuleById(@PathVariable UUID id) {
        Module module = moduleService.findById(id);
        return ResponseEntity.ok(PublicModuleDTO.fromEntity(module));
    }
}
