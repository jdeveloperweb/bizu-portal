package com.bizu.portal.student.application;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class TaskSuggestionDTO {
    private String text;
    private String type;
    private String actionLabel;
    private String color;
    private CreateStudentTaskDTO taskToCreate;
}
