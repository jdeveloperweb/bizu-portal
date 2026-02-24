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

    public List<Map<String, Object>> getGlobalRanking(int limit) {
        String sql = """
            SELECT 
                g.user_id as "id",
                u.name as "name",
                u.avatar_url as "avatar",
                COALESCE(g.total_xp, 0) as "xp",
                COALESCE(g.current_streak, 0) as "streak",
                RANK() OVER (ORDER BY g.total_xp DESC) as "rank"
            FROM student.gamification_stats g
            JOIN identity.users u ON g.user_id = u.id
            ORDER BY g.total_xp DESC
            LIMIT ?
            """;
        
        return jdbcTemplate.queryForList(sql, limit);
    }

    public Map<String, Object> getUserRanking(UUID userId) {
        String sql = """
            WITH RankedUsers AS (
                SELECT 
                    user_id,
                    total_xp,
                    current_streak,
                    RANK() OVER (ORDER BY total_xp DESC) as rank
                FROM student.gamification_stats
            )
            SELECT 
                COALESCE(r.rank, 0) as "rank",
                u.name as "name",
                u.avatar_url as "avatar",
                COALESCE(r.total_xp, 0) as "xp",
                COALESCE(r.current_streak, 0) as "streak"
            FROM identity.users u
            LEFT JOIN RankedUsers r ON u.id = r.user_id
            WHERE u.id = ?
            """;
        
        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, userId);
        return result.isEmpty() ? Map.of("rank", 0, "xp", 0, "streak", 0, "name", "Usuário") : result.get(0);
    }
}
