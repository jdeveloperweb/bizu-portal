package com.bizu.portal.content.api.dto;

import com.bizu.portal.content.domain.Course;
import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class PublicCourseSlimDTO {
    private UUID id;
    private String title;
    private String description;
    private String thumbnailUrl;
    private String themeColor;
    private String textColor;
    private String level;
    private String category;

    public static PublicCourseSlimDTO fromEntity(Course course) {
        if (course == null) return null;
        return PublicCourseSlimDTO.builder()
                .id(course.getId())
                .title(course.getTitle())
                .description(course.getDescription())
                .thumbnailUrl(course.getThumbnailUrl())
                .themeColor(course.getThemeColor())
                .textColor(course.getTextColor())
                .level(course.getLevel())
                .category(course.getCategory())
                .build();
    }
}
