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
public class PomodoroSessionRequest {
    private String subject;
    private Integer focusMinutes;
    private Integer cycles;
    private UUID courseId;
}
