package com.bizu.portal.student.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PomodoroSummaryDTO {
    private Integer totalFocusToday;
    private Integer completedCycles;
    private List<PomodoroSessionDTO> recentSessions;
}
