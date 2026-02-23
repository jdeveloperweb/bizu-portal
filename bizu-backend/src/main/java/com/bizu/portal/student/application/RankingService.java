package com.bizu.portal.student.application;

import com.bizu.portal.student.infrastructure.GamificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class RankingService {

    private final GamificationRepository gamificationRepository;

    public List<Map<String, Object>> getGlobalRanking(int limit) {
        // In a real application, this would join with users table
        return gamificationRepository.findAllOrderByTotalXpDesc()
            .stream()
            .limit(limit)
            .map(stat -> Map.<String, Object>of(
                "userId", stat.getUserId(),
                "xp", stat.getTotalXp(),
                "streak", stat.getCurrentStreak()
            ))
            .collect(Collectors.toList());
    }
}
