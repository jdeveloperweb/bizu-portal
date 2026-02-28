package com.bizu.portal.student.application;

import lombok.RequiredArgsConstructor;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PublicProfileService {

    private final JdbcTemplate jdbcTemplate;

    public Map<String, Object> getUserProfile(String nickname, UUID currentUserId) {
        String sql = """
            WITH RankedUsers AS (
                SELECT 
                    u.id as user_id,
                    u.name,
                    u.nickname,
                    u.avatar_url,
                    COALESCE(g.total_xp, 0) as total_xp,
                    COALESCE(g.current_streak, 0) as current_streak,
                    RANK() OVER (ORDER BY COALESCE(g.total_xp, 0) DESC) as rank
                FROM identity.users u
                LEFT JOIN student.gamification_stats g ON u.id = g.user_id
            )
            SELECT 
                r.user_id as "id",
                r.nickname as "nickname",
                r.name as "name",
                r.avatar_url as "avatar",
                r.total_xp as "xp",
                r.current_streak as "streak",
                r.rank as "rank",
                FLOOR(POWER(COALESCE(r.total_xp, 0) / 1000.0, 2.0/3.0)) + 1 as "level",
                (SELECT status FROM identity.friendships f 
                 WHERE (f.requester_id = ? AND f.addressee_id = r.user_id) 
                    OR (f.requester_id = r.user_id AND f.addressee_id = ?)
                 LIMIT 1) as "friendshipStatus",
                (SELECT id FROM identity.friendships f 
                 WHERE (f.requester_id = ? AND f.addressee_id = r.user_id) 
                    OR (f.requester_id = r.user_id AND f.addressee_id = ?)
                 LIMIT 1) as "friendshipId"
            FROM RankedUsers r
            WHERE r.nickname = ?
            """;
        
        List<Map<String, Object>> result = jdbcTemplate.queryForList(sql, currentUserId, currentUserId, currentUserId, currentUserId, nickname);
        if (result.isEmpty()) {
            throw new RuntimeException("User not found: " + nickname);
        }
        
        Map<String, Object> profile = result.get(0);
        UUID userId = (UUID) profile.get("id");
        
        // Fetch earned badges
        String badgesSql = """
            SELECT b.name, b.description, b.icon_url as icon, b.color, ub.earned_at as "earnedAt"
            FROM student.badges b
            JOIN student.user_badges ub ON b.id = ub.badge_id
            WHERE ub.user_id = ?
            ORDER BY ub.earned_at DESC
            """;
        List<Map<String, Object>> badges = jdbcTemplate.queryForList(badgesSql, userId);
        profile.put("badges", badges);

        // Fetch PvP stats
        String pvpSql = """
            SELECT 
                COUNT(*) FILTER (WHERE winner_id = ?) as wins,
                COUNT(*) FILTER (WHERE (challenger_id = ? OR opponent_id = ?) AND winner_id != ? AND winner_id IS NOT NULL) as losses
            FROM student.duels
            WHERE status = 'COMPLETED'
            """;
        Map<String, Object> pvpStats = jdbcTemplate.queryForMap(pvpSql, userId, userId, userId, userId);
        profile.put("pvpWins", pvpStats.get("wins"));
        profile.put("pvpLosses", pvpStats.get("losses"));

        // Fetch strongest subject
        String subjectSql = """
            WITH all_attempts AS (
                SELECT a.is_correct, q.subject
                FROM student.attempts a
                JOIN content.questions q ON a.question_id = q.id
                WHERE a.user_id = ? AND q.subject IS NOT NULL
                UNION ALL
                SELECT s.student_correct as is_correct, s.snapshot_subject as subject
                FROM student.activity_attempt_item_snapshots s
                JOIN student.activity_attempts aa ON s.attempt_id = aa.id
                WHERE aa.user_id = ? AND s.snapshot_subject IS NOT NULL AND s.student_selected_option IS NOT NULL
                UNION ALL
                SELECT dq.challenger_correct as is_correct, q.subject
                FROM student.duel_questions dq
                JOIN student.duels d ON dq.duel_id = d.id
                JOIN content.questions q ON dq.question_id = q.id
                WHERE d.challenger_id = ? AND dq.challenger_answer_index IS NOT NULL AND q.subject IS NOT NULL
                UNION ALL
                SELECT dq.opponent_correct as is_correct, q.subject
                FROM student.duel_questions dq
                JOIN student.duels d ON dq.duel_id = d.id
                JOIN content.questions q ON dq.question_id = q.id
                WHERE d.opponent_id = ? AND dq.opponent_answer_index IS NOT NULL AND q.subject IS NOT NULL
            )
            SELECT subject
            FROM all_attempts
            GROUP BY subject
            ORDER BY CAST(SUM(CASE WHEN is_correct THEN 1 ELSE 0 END) AS FLOAT) / COUNT(*) DESC, COUNT(*) DESC
            LIMIT 1
            """;
        List<String> subjects = jdbcTemplate.queryForList(subjectSql, String.class, userId, userId, userId, userId);
        profile.put("strongestSubject", subjects.isEmpty() ? null : subjects.get(0));
        
        return profile;
    }
}
