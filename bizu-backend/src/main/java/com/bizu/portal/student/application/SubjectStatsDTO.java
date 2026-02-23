package com.bizu.portal.student.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SubjectStatsDTO {
    private String subject;
    private long totalQuestions;
    private long correctAnswers;
    private double accuracy;
}
