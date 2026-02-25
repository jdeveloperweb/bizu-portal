package com.bizu.portal.student.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RewardDTO {
    private int xpGained;
    private int totalXp;
    private int currentLevel;
    private int previousLevel;
    private boolean leveledUp;
    private double nextLevelProgress;
}
