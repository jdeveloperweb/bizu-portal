package com.bizu.portal.student.api;

import com.bizu.portal.commerce.application.EntitlementService;
import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.identity.infrastructure.UserRepository;
import com.bizu.portal.content.application.MaterialService;
import com.bizu.portal.content.domain.Material;
import com.bizu.portal.content.infrastructure.MaterialRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Locale;
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
    private final UserRepository userRepository;

    private final com.bizu.portal.student.infrastructure.MaterialCompletionRepository completionRepository;
    private final com.bizu.portal.student.application.GamificationService gamificationService;
    private final com.bizu.portal.student.application.CertificateService certificateService;

    @GetMapping
    public ResponseEntity<List<MaterialLibraryDTO>> getAllMaterials(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        
        List<UUID> subscribedCourseIds = entitlementService.getActiveEntitlements(userId)
            .stream()
            .map(e -> e.getCourse().getId())
            .collect(Collectors.toList());
            
        List<Material> allMaterials = materialRepository.findAll();
        List<MaterialLibraryDTO> subscribedMaterials = allMaterials.stream()
            .filter(m -> m.getModule() != null && m.getModule().getCourse() != null && 
                         subscribedCourseIds.contains(m.getModule().getCourse().getId()))
            .filter(this::isAttachedMaterial)
            .map(this::mapToDTO)
            .collect(Collectors.toList());
            
        return ResponseEntity.ok(subscribedMaterials);
    }


    @GetMapping("/completed")
    public ResponseEntity<List<UUID>> getCompletedMaterials(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(completionRepository.findByUserId(userId)
            .stream()
            .map(c -> c.getMaterial().getId())
            .collect(Collectors.toList()));
    }

    @PostMapping("/{id}/complete")
    public ResponseEntity<com.bizu.portal.student.application.RewardDTO> toggleCompletion(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        java.util.Optional<com.bizu.portal.student.domain.MaterialCompletion> existing = completionRepository.findByUserIdAndMaterialId(userId, id);
        
        boolean completed = false;
        if (existing.isPresent()) {
            completionRepository.delete(existing.get());
        } else {
            Material material = materialService.findById(id);
            com.bizu.portal.student.domain.MaterialCompletion completion = com.bizu.portal.student.domain.MaterialCompletion.builder()
                .user(userRepository.getReferenceById(userId))
                .material(material)
                .build();
            completionRepository.save(completion);
            completed = true;
        }
        
        com.bizu.portal.student.application.RewardDTO reward = null;
        if (completed) {
            // Recompensa Fixa por material: 50 XP
            reward = gamificationService.addXp(userId, 50);
            
            // Disparar verificação de completude 100% de curso e emitir certificado
            certificateService.checkAndIssueCertificate(userId, id);
        }
        
        return ResponseEntity.ok(reward);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Material> getMaterialById(@PathVariable UUID id) {
        return ResponseEntity.ok(materialService.findById(id));
    }

    @GetMapping("/module/{moduleId}")
    public ResponseEntity<List<MaterialLibraryDTO>> getMaterialsByModule(@PathVariable UUID moduleId) {
        List<MaterialLibraryDTO> moduleMaterials = materialService.findByModuleId(moduleId).stream()
            .filter(this::isAttachedMaterial)
            .map(this::mapToDTO)
            .collect(Collectors.toList());

        return ResponseEntity.ok(moduleMaterials);
    }

    private MaterialLibraryDTO mapToDTO(Material m) {
        String moduleTitle = "N/A";
        String courseTitle = "N/A";
        
        if (m.getModule() != null) {
            moduleTitle = m.getModule().getTitle();
            if (m.getModule().getCourse() != null) {
                courseTitle = m.getModule().getCourse().getTitle();
            }
        }
        
        return MaterialLibraryDTO.builder()
            .id(m.getId())
            .title(m.getTitle())
            .description(m.getDescription())
            .fileUrl(m.getFileUrl())
            .fileType(m.getFileType())
            .moduleId(m.getModuleId())
            .moduleTitle(moduleTitle)
            .courseTitle(courseTitle)
            .build();
    }


    private boolean isAttachedMaterial(Material material) {
        if (material == null) {
            return false;
        }

        String fileType = material.getFileType();
        String normalizedFileType = fileType == null ? "" : fileType.trim().toUpperCase(Locale.ROOT);
        boolean isArticle = "ARTICLE".equals(normalizedFileType);
        boolean hasAttachedFile = material.getFileUrl() != null && !material.getFileUrl().isBlank();

        if (isArticle || !hasAttachedFile) {
            return false;
        }

        // Filtro para excluir links externos (YouTube/Vimeo) - Materiais da Biblioteca devem ser arquivos
        String url = material.getFileUrl().toLowerCase();
        boolean isExternalVideo = url.contains("youtube.com") || 
                                 url.contains("youtu.be") || 
                                 url.contains("vimeo.com");

        return !isExternalVideo;
    }

}
