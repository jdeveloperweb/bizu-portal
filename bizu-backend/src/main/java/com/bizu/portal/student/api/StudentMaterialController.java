package com.bizu.portal.student.api;

import com.bizu.portal.commerce.application.EntitlementService;
import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.content.application.MaterialService;
import com.bizu.portal.content.domain.Material;
import com.bizu.portal.content.infrastructure.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Objects;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/student/materials")
@RequiredArgsConstructor
public class StudentMaterialController {

    private final MaterialService materialService;
    private final MaterialRepository materialRepository;
    private final EntitlementService entitlementService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<Material>> getAllMaterials(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        
        // Busca cursos que o usuário tem direito de acessar
        List<UUID> subscribedCourseIds = entitlementService.getActiveEntitlements(userId)
            .stream()
            .map(e -> e.getCourse().getId())
            .collect(Collectors.toList());
            
        // Filtra todos os materiais que pertencem a esses cursos
        List<Material> allMaterials = materialRepository.findAll();
        List<Material> subscribedMaterials = allMaterials.stream()
            .filter(m -> m.getModule() != null && m.getModule().getCourse() != null && 
                         subscribedCourseIds.contains(m.getModule().getCourse().getId()))
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(subscribedMaterials);
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
