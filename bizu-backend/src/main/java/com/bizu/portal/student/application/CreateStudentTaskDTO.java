package com.bizu.portal.student.application;

import lombok.Data;

@Data
public class CreateStudentTaskDTO {
    private String title;
    private String description;
    private String subject;
    private String priority;
    private String status;
    private String source;
    private String dueDate;
    private String linkedActionType;
    private String linkedActionLabel;
    private String linkedActionHref;
}
