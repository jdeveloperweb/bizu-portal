package com.bizu.portal.student.application;

import com.bizu.portal.student.domain.ActivityAttempt;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.redis.core.StringRedisTemplate;
import org.springframework.data.redis.core.ZSetOperations;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.time.DayOfWeek;
import java.time.OffsetDateTime;
import java.time.temporal.IsoFields;
import java.time.temporal.TemporalAdjusters;
import java.util.*;
import java.util.stream.Collectors;

/**
 * Redis-backed ranking system for OfficialExam (Simulado).
 * Uses Sorted Sets for O(log N) leaderboard operations.
 *
 * Key format: ranking:exam:{examId}:W{weekNumber}
 * Score: points
 * Member: userId
 *
 * Reset: Saturday 23:59 → weekly cycle archive.
 * Read: Redis (hot path)
 * History: Postgres (cold path via ActivityAttemptRepository)
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class RedisRankingService {

    private static final String RANKING_KEY_PREFIX = "ranking:exam:";
    private static final String GLOBAL_WEEKLY_KEY = "ranking:global:W";

    private final StringRedisTemplate redisTemplate;

    /**
     * Update ranking after a simulado attempt is completed.
     */
    public void updateRanking(ActivityAttempt attempt) {
        if (attempt.getWeeklyCycleKey() == null) return;

        String key = RANKING_KEY_PREFIX + attempt.getWeeklyCycleKey();
        String userId = attempt.getUser().getId().toString();
        double score = attempt.getScorePoints();

        // Only keep the best score for each user
        Double currentScore = redisTemplate.opsForZSet().score(key, userId);
        if (currentScore == null || score > currentScore) {
            redisTemplate.opsForZSet().add(key, userId, score);
        }

        // Also update global weekly ranking
        int week = OffsetDateTime.now().get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        String globalKey = GLOBAL_WEEKLY_KEY + week;
        Double globalScore = redisTemplate.opsForZSet().score(globalKey, userId);
        double newGlobal = (globalScore != null ? globalScore : 0) + score;
        redisTemplate.opsForZSet().add(globalKey, userId, newGlobal);
    }

    /**
     * Get leaderboard for a specific exam+week.
     */
    public List<Map<String, Object>> getExamLeaderboard(String weeklyCycleKey, int limit) {
        String key = RANKING_KEY_PREFIX + weeklyCycleKey;
        return getLeaderboard(key, limit);
    }

    /**
     * Get global weekly leaderboard.
     */
    public List<Map<String, Object>> getGlobalWeeklyLeaderboard(int limit) {
        int week = OffsetDateTime.now().get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        String key = GLOBAL_WEEKLY_KEY + week;
        return getLeaderboard(key, limit);
    }

    /**
     * Get user's rank in a specific leaderboard.
     */
    public Optional<Long> getUserRank(String weeklyCycleKey, UUID userId) {
        String key = RANKING_KEY_PREFIX + weeklyCycleKey;
        Long rank = redisTemplate.opsForZSet().reverseRank(key, userId.toString());
        return Optional.ofNullable(rank).map(r -> r + 1); // 1-indexed
    }

    /**
     * Reset weekly rankings every Saturday at 23:59.
     * Archives are kept in Postgres via ActivityAttempt records.
     */
    @Scheduled(cron = "59 23 * * 6") // Saturday 23:59
    public void resetWeeklyRankings() {
        int week = OffsetDateTime.now().get(IsoFields.WEEK_OF_WEEK_BASED_YEAR);
        String globalKey = GLOBAL_WEEKLY_KEY + week;

        // Archive final state (keys will naturally expire or be overwritten next week)
        log.info("Weekly ranking reset triggered for week {}", week);

        // Set TTL on old keys (7 days)
        Set<String> keys = redisTemplate.keys(RANKING_KEY_PREFIX + "*:W" + week);
        if (keys != null) {
            keys.forEach(k -> redisTemplate.expire(k, java.time.Duration.ofDays(7)));
        }
        redisTemplate.expire(globalKey, java.time.Duration.ofDays(7));
    }

    private List<Map<String, Object>> getLeaderboard(String key, int limit) {
        Set<ZSetOperations.TypedTuple<String>> tuples =
            redisTemplate.opsForZSet().reverseRangeWithScores(key, 0, limit - 1);

        if (tuples == null) return List.of();

        List<Map<String, Object>> result = new ArrayList<>();
        int rank = 1;
        for (ZSetOperations.TypedTuple<String> tuple : tuples) {
            Map<String, Object> entry = new LinkedHashMap<>();
            entry.put("rank", rank++);
            entry.put("userId", tuple.getValue());
            entry.put("score", tuple.getScore() != null ? tuple.getScore().intValue() : 0);
            result.add(entry);
        }
        return result;
    }
}
