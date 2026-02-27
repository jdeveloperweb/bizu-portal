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
        return result.get(0);
    }
}
