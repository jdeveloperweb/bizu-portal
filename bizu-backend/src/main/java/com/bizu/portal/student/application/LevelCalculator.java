package com.bizu.portal.student.application;

import org.springframework.stereotype.Component;

@Component
public class LevelCalculator {

    private static final int BASE_XP = 1000;
    private static final double EXPONENT = 1.5;

    public int calculateLevel(int totalXp) {
        if (totalXp <= 0) return 1;
        // Level = (XP / BASE_XP) ^ (1/EXPONENT) + 1
        return (int) Math.floor(Math.pow((double) totalXp / BASE_XP, 1.0 / EXPONENT)) + 1;
    }

    public int calculateXpForLevel(int level) {
        if (level <= 1) return 0;
        // XP = BASE_XP * (level - 1) ^ EXPONENT
        return (int) (BASE_XP * Math.pow(level - 1, EXPONENT));
    }

    public double calculateProgressToNextLevel(int totalXp) {
        int currentLevel = calculateLevel(totalXp);
        int currentLevelXp = calculateXpForLevel(currentLevel);
        int nextLevelXp = calculateXpForLevel(currentLevel + 1);
        
        if (nextLevelXp == currentLevelXp) return 0;
        return (double) (totalXp - currentLevelXp) / (nextLevelXp - currentLevelXp) * 100;
    }

    public java.util.List<LevelInfo> getAllLevelRequirements(int maxLevel) {
        java.util.List<LevelInfo> levels = new java.util.ArrayList<>();
        for (int i = 1; i <= maxLevel; i++) {
            levels.add(new LevelInfo(i, calculateXpForLevel(i)));
        }
        return levels;
    }

    @lombok.Value
    public static class LevelInfo {
        int level;
        int requiredXp;
    }
}
