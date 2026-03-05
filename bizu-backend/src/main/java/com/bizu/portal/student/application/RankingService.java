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
                    u.nickname as nickname,
                    u.avatar_url as avatar,
                    COALESCE(g.total_xp, 0) as xp,
                    FLOOR(POWER(COALESCE(g.total_xp, 0) / 1000.0, 2.0/3.0)) + 1 as level,
                    COALESCE(g.current_streak, 0) as streak,
                    g.active_aura as "activeAura",
                    g.active_border as "activeBorder",
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

    public List<Map<String, Object>> getDuelRanking(UUID courseId, int limit) {
        String condition = courseId != null ? "JOIN commerce.course_entitlements ce ON u.id = ce.user_id WHERE ce.course_id = ? AND ce.active = true " : "";
        
        String sql = """
            SELECT
                u.id as id,
                u.name as name,
                u.nickname as nickname,
                u.avatar_url as avatar,
                FLOOR(POWER(COALESCE(gs.total_xp, 0) / 1000.0, 2.0/3.0)) + 1 as level,
                gs.active_aura as "activeAura",
                gs.active_border as "activeBorder",
                COUNT(d.id) as wins,
                RANK() OVER (ORDER BY COUNT(d.id) DESC) as rank
            FROM identity.users u
            LEFT JOIN student.gamification_stats gs ON u.id = gs.user_id
            JOIN student.duels d ON u.id = d.winner_id
            """ + condition + (courseId != null ? " AND " : " WHERE ") + """
            d.status = 'COMPLETED'
            GROUP BY u.id, u.name, u.nickname, u.avatar_url, gs.total_xp, gs.active_aura, gs.active_border
            ORDER BY wins DESC
            LIMIT ?
            """;
        
        if (courseId != null) {
            return jdbcTemplate.queryForList(sql, courseId, limit);
        } else {
            return jdbcTemplate.queryForList(sql, limit);
        }
    }

    public List<Map<String, Object>> getSimuladoRanking(UUID courseId, int limit) {
        String condition = courseId != null ? "JOIN content.simulados s ON sr.simulado_id = s.id WHERE s.course_id = ? " : "";
        
        String sql = """
            SELECT
                u.id as id,
                u.name as name,
                u.nickname as nickname,
                u.avatar_url as avatar,
                FLOOR(POWER(COALESCE(gs.total_xp, 0) / 1000.0, 2.0/3.0)) + 1 as level,
                gs.active_aura as "activeAura",
                gs.active_border as "activeBorder",
                MAX(sr.score) as best_score,
                RANK() OVER (ORDER BY MAX(sr.score) DESC) as rank
            FROM identity.users u
            LEFT JOIN student.gamification_stats gs ON u.id = gs.user_id
            JOIN student.simulado_results sr ON u.id = sr.user_id
            """ + condition + """
            GROUP BY u.id, u.name, u.nickname, u.avatar_url, gs.total_xp, gs.active_aura, gs.active_border
            ORDER BY best_score DESC
            LIMIT ?
            """;
            
        if (courseId != null) {
            return jdbcTemplate.queryForList(sql, courseId, limit);
        } else {
            return jdbcTemplate.queryForList(sql, limit);
        }
    }

    public List<Map<String, Object>> getWeeklyXpRanking(UUID courseId, int limit) {
        String condition = courseId != null ? "JOIN commerce.course_entitlements ce ON u.id = ce.user_id WHERE ce.course_id = ? AND ce.active = true " : "";
        
        String sql = """
            SELECT
                u.id as id,
                u.name as name,
                u.nickname as nickname,
                u.avatar_url as avatar,
                FLOOR(POWER(COALESCE(gs.total_xp, 0) / 1000.0, 2.0/3.0)) + 1 as level,
                gs.active_aura as "activeAura",
                gs.active_border as "activeBorder",
                SUM(aa.xp_earned) as weekly_xp,
                RANK() OVER (ORDER BY SUM(aa.xp_earned) DESC) as rank
            FROM identity.users u
            LEFT JOIN student.gamification_stats gs ON u.id = gs.user_id
            JOIN student.activity_attempts aa ON u.id = aa.user_id
            """ + condition + (courseId != null ? " AND " : " WHERE ") + """
            aa.status = 'COMPLETED' AND aa.finished_at >= CURRENT_DATE - INTERVAL '7 days'
            GROUP BY u.id, u.name, u.nickname, u.avatar_url, gs.total_xp, gs.active_aura, gs.active_border
            ORDER BY weekly_xp DESC
            LIMIT ?
            """;
            
        if (courseId != null) {
            return jdbcTemplate.queryForList(sql, courseId, limit);
        } else {
            return jdbcTemplate.queryForList(sql, limit);
        }
    }

    public Map<String, Object> getUserRanking(UUID userId, UUID courseId) {
        String condition = courseId != null ? "JOIN commerce.course_entitlements ce ON u.id = ce.user_id WHERE ce.course_id = ? AND ce.active = true " : "";
        
        String sql = """
            WITH RankedUsers AS (
                SELECT 
                    u.id as user_id,
                    u.nickname as nickname,
                    u.name,
                    u.avatar_url,
                    COALESCE(g.total_xp, 0) as total_xp,
                    COALESCE(g.current_streak, 0) as current_streak,
                    FLOOR(POWER(COALESCE(g.total_xp, 0) / 1000.0, 2.0/3.0)) + 1 as level,
                    g.active_aura,
                    g.active_border,
                    RANK() OVER (ORDER BY COALESCE(g.total_xp, 0) DESC) as rank
                FROM identity.users u
                LEFT JOIN student.gamification_stats g ON u.id = g.user_id
                """ + condition + """
            )
            SELECT 
                r.rank as "rank",
                r.nickname as "nickname",
                r.name as "name",
                r.avatar_url as "avatar",
                r.total_xp as "xp",
                r.current_streak as "streak",
                r.level as "level",
                r.active_aura as "activeAura",
                r.active_border as "activeBorder"
            FROM RankedUsers r
            WHERE r.user_id = ?
            """;
        
        List<Map<String, Object>> result;
        if (courseId != null) {
            result = jdbcTemplate.queryForList(sql, courseId, userId);
        } else {
            result = jdbcTemplate.queryForList(sql, userId);
        }
        return result.isEmpty() ? Map.of("rank", 0, "xp", 0, "streak", 0, "name", "Usuário") : result.get(0);
    }
}
