package com.bizu.portal.content.api.dto;

import com.bizu.portal.content.domain.Module;
import lombok.Builder;
import lombok.Data;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Data
@Builder
public class PublicModuleDTO {
    private UUID id;
    private String title;
    private String description;
    private Integer orderIndex;
    private boolean isFree;
    private Integer durationMinutes;
    private UUID courseId;
    private List<PublicMaterialDTO> materials;
    private List<PublicQuestionDTO> questions;

    public static PublicModuleDTO fromEntity(Module module) {
        if (module == null) return null;
        return PublicModuleDTO.builder()
                .id(module.getId())
                .title(module.getTitle())
                .description(module.getDescription())
                .orderIndex(module.getOrderIndex())
                .isFree(module.isFree())
                .durationMinutes(module.getDurationMinutes())
                .courseId(module.getCourseId())
                .materials(module.getMaterials() != null ? 
                    module.getMaterials().stream().map(PublicMaterialDTO::fromEntity).collect(Collectors.toList()) : null)
                .questions(module.getQuestions() != null ? 
                    module.getQuestions().stream().map(PublicQuestionDTO::fromEntity).collect(Collectors.toList()) : null)
                .build();
    }
}
