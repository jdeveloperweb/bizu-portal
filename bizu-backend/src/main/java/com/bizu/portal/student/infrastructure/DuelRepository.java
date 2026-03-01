package com.bizu.portal.student.infrastructure;

import com.bizu.portal.student.domain.Duel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DuelRepository extends JpaRepository<Duel, UUID> {
    @org.springframework.data.jpa.repository.Query("SELECT d FROM Duel d JOIN FETCH d.challenger JOIN FETCH d.opponent WHERE d.opponent.id = :opponentId AND d.status = :status")
    List<Duel> findAllByOpponentIdAndStatus(@org.springframework.data.repository.query.Param("opponentId") UUID opponentId, @org.springframework.data.repository.query.Param("status") String status);

    @Query(value = "SELECT u.id, u.name as name, u.nickname, u.avatar_url as avatar, COUNT(d.id) as wins " +
                   "FROM identity.users u " +
                   "JOIN student.duels d ON u.id = d.winner_id " +
                   "JOIN commerce.course_entitlements ce ON u.id = ce.user_id " +
                   "WHERE d.status = 'COMPLETED' AND d.completed_at >= CURRENT_DATE - INTERVAL '7 days' " +
                   "AND ce.course_id = :courseId AND ce.active = true " +
                   "GROUP BY u.id, u.name, u.nickname, u.avatar_url " +
                   "ORDER BY wins DESC", 
            countQuery = "SELECT COUNT(DISTINCT u.id) FROM identity.users u " +
                         "JOIN student.duels d ON u.id = d.winner_id " +
                         "JOIN commerce.course_entitlements ce ON u.id = ce.user_id " +
                         "WHERE d.status = 'COMPLETED' AND d.completed_at >= CURRENT_DATE - INTERVAL '7 days' " +
                         "AND ce.course_id = :courseId AND ce.active = true",
            nativeQuery = true)
    org.springframework.data.domain.Page<Object[]> getWeeklyRanking(@org.springframework.data.repository.query.Param("courseId") UUID courseId, org.springframework.data.domain.Pageable pageable);

    @Query("SELECT d FROM Duel d JOIN FETCH d.challenger JOIN FETCH d.opponent LEFT JOIN FETCH d.winner WHERE (d.challenger.id = :userId OR d.opponent.id = :userId) AND d.status = 'COMPLETED' ORDER BY d.completedAt DESC")
    org.springframework.data.domain.Page<Duel> findHistoryByUserId(@org.springframework.data.repository.query.Param("userId") UUID userId, org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT d FROM Duel d JOIN FETCH d.challenger JOIN FETCH d.opponent WHERE (d.challenger.id = :userId OR d.opponent.id = :userId) AND d.status = 'IN_PROGRESS' ORDER BY d.createdAt DESC")
    java.util.List<Duel> findActiveDuelsByUserId(@org.springframework.data.repository.query.Param("userId") java.util.UUID userId);

    @Query("SELECT d FROM Duel d JOIN FETCH d.challenger JOIN FETCH d.opponent WHERE d.status = 'IN_PROGRESS' AND d.updatedAt < :timeout")
    List<Duel> findInactiveInProgressDuels(@org.springframework.data.repository.query.Param("timeout") java.time.OffsetDateTime timeout);

    @Query(value = "WITH user_duels AS (" +
                   "  SELECT id, winner_id, completed_at FROM student.duels " +
                   "  WHERE (challenger_id = :userId OR opponent_id = :userId) AND status = 'COMPLETED' " +
                   "  ORDER BY completed_at DESC" +
                   "), streak_calc AS (" +
                   "  SELECT winner_id, ROW_NUMBER() OVER (ORDER BY completed_at DESC) as rn " +
                   "  FROM user_duels" +
                   ") " +
                   "SELECT " +
                   "(SELECT COUNT(*) FROM student.duels WHERE winner_id = :userId AND status = 'COMPLETED') as wins, " +
                   "(SELECT COUNT(*) FROM student.duels WHERE (challenger_id = :userId OR opponent_id = :userId) AND (winner_id != :userId OR winner_id IS NULL) AND status = 'COMPLETED') as losses, " +
                   "COALESCE((SELECT COUNT(*) FROM ( " +
                   "  SELECT winner_id, ROW_NUMBER() OVER (ORDER BY completed_at DESC) as rn " +
                   "  FROM student.duels " +
                   "  WHERE (challenger_id = :userId OR opponent_id = :userId) AND status = 'COMPLETED' " +
                   "  ORDER BY completed_at DESC " +
                   ") s WHERE winner_id = :userId AND rn = (SELECT COUNT(*) FROM (SELECT winner_id, rn FROM ( " +
                   "  SELECT winner_id, ROW_NUMBER() OVER (ORDER BY completed_at DESC) as rn " +
                   "  FROM student.duels " +
                   "  WHERE (challenger_id = :userId OR opponent_id = :userId) AND status = 'COMPLETED' " +
                   "  ORDER BY completed_at DESC " +
                   ") s2 WHERE s2.rn <= s.rn AND winner_id = :userId) s3)), 0) as streak, " +
                   "(SELECT COALESCE(daily_abandon_count, 0) FROM student.gamification_stats WHERE user_id = :userId) as \"dailyAbandonCount\", " +
                   "(SELECT abandon_blocked_until FROM student.gamification_stats WHERE user_id = :userId) as \"abandonBlockedUntil\"",
            nativeQuery = true)
    java.util.Map<String, Object> getMyDuelStats(@org.springframework.data.repository.query.Param("userId") java.util.UUID userId);
}
