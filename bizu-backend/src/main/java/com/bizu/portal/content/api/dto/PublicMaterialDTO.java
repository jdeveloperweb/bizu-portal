package com.bizu.portal.content.api.dto;

import com.bizu.portal.content.domain.Material;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class PublicMaterialDTO {
    private UUID id;
    private String title;
    private String description;
    private String fileUrl;
    private String fileType;
    private boolean isFree;
    private Integer durationMinutes;
    private UUID moduleId;

    public static PublicMaterialDTO fromEntity(Material material) {
        if (material == null) return null;
        return PublicMaterialDTO.builder()
                .id(material.getId())
                .title(material.getTitle())
                .description(material.getDescription())
                .fileUrl(material.isFree() ? material.getFileUrl() : null)
                .fileType(material.getFileType())
                .isFree(material.isFree())
                .durationMinutes(material.getDurationMinutes())
                .moduleId(material.getModuleId())
                .build();
    }
}
