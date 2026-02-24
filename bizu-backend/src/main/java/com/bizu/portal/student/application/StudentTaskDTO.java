package com.bizu.portal.student.application;

import lombok.Builder;
import lombok.Data;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
public class StudentTaskDTO {
    private UUID id;
    private String title;
    private String description;
    private String subject;
    private String priority;
    private String status;
    private String source;
    private String dueDate;
    
    // linkedAction
    private String linkedActionType;
    private String linkedActionLabel;
    private String linkedActionHref;

    private OffsetDateTime createdAt;
    private OffsetDateTime updatedAt;
}
