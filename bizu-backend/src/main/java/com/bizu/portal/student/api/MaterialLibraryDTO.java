package com.bizu.portal.student.api;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class MaterialLibraryDTO {
    private UUID id;
    private String title;
    private String description;
    private String fileUrl;
    private String fileType;
    private UUID moduleId;
    private String moduleTitle;
    private String courseTitle;
}
