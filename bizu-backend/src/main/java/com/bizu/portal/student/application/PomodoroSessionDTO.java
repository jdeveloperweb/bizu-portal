package com.bizu.portal.student.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PomodoroSessionDTO {
    private UUID id;
    private String subject;
    private Integer focusMinutes;
    private Integer cycles;
    private String completedAt; // Formatted date string or OffsetDateTime translated to string
}
