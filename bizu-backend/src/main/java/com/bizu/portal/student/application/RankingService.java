package com.bizu.portal.student.application;

import com.bizu.portal.student.infrastructure.GamificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class RankingService {

    private final JdbcTemplate jdbcTemplate;

    public List<Map<String, Object>> getGlobalRanking(UUID courseId, int limit) {
        String condition = courseId != null ? "JOIN commerce.course_entitlements ce ON u.id = ce.user_id WHERE ce.course_id = ? AND ce.active = true " : "";
        Object[] args = courseId != null ? new Object[]{limit, courseId} : new Object[]{limit};
        
        String sql = """
            WITH RankedUsers AS (
                SELECT 
                    u.id as id,
                    u.name as name,
                    u.avatar_url as avatar,
                    COALESCE(g.total_xp, 0) as xp,
                    FLOOR(POWER(COALESCE(g.total_xp, 0) / 1000.0, 2.0/3.0)) + 1 as level,
                    COALESCE(g.current_streak, 0) as streak,
                    RANK() OVER (ORDER BY COALESCE(g.total_xp, 0) DESC) as rank
                FROM identity.users u
                LEFT JOIN student.gamification_stats g ON u.id = g.user_id
                """ + condition + """
            )
            SELECT * FROM RankedUsers 
            ORDER BY rank ASC
            LIMIT ?
            """;
        
        if (courseId != null) {
            return jdbcTemplate.queryForList(sql, courseId, limit);
        } else {
            return jdbcTemplate.queryForList(sql, limit);
        }
    }

    public Map<String, Object> getUserRanking(UUID userId) {
        String sql = """
            WITH RankedUsers AS (
                SELECT 
                    u.id as user_id,
                    u.name,
                    u.avatar_url,
                    COALESCE(g.total_xp, 0) as total_xp,
                    COALESCE(g.current_streak, 0) as current_streak,
                    RANK() OVER (ORDER BY COALESCE(g.total_xp, 0) DESC) as rank
                FROM identity.users u
                LEFT JOIN student.gamification_stats g ON u.id = g.user_id
            )
            SELECT 
                r.rank as "rank",
                r.name as "name",
                r.avatar_url as "avatar",
                r.total_xp as "xp",
                r.current_streak as "streak"
            FROM RankedUsers r
            WHERE r.user_id = ?
            """;
        
        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, userId);
        return result.isEmpty() ? Map.of("rank", 0, "xp", 0, "streak", 0, "name", "Usuário") : result.get(0);
    }
}
