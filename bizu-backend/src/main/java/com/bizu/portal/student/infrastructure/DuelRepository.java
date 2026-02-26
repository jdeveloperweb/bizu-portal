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

    @Query(value = "SELECT u.id, u.name as name, COUNT(d.id) as wins " +
                   "FROM identity.users u " +
                   "JOIN student.duels d ON u.id = d.winner_id " +
                   "GROUP BY u.id, u.name " +
                   "ORDER BY wins DESC LIMIT 10", nativeQuery = true)
    List<Object[]> getRanking();

    @org.springframework.data.jpa.repository.Query("SELECT d FROM Duel d JOIN FETCH d.challenger JOIN FETCH d.opponent WHERE (d.challenger.id = :userId OR d.opponent.id = :userId) AND d.status = 'IN_PROGRESS' ORDER BY d.createdAt DESC")
    java.util.List<Duel> findActiveDuelsByUserId(@org.springframework.data.repository.query.Param("userId") java.util.UUID userId);

    @Query(value = "SELECT " +
                   "(SELECT COUNT(*) FROM student.duels WHERE winner_id = :userId AND status = 'COMPLETED') as wins, " +
                   "(SELECT COUNT(*) FROM student.duels WHERE (challenger_id = :userId OR opponent_id = :userId) AND (winner_id != :userId OR winner_id IS NULL) AND status = 'COMPLETED') as losses",
            nativeQuery = true)
    java.util.Map<String, Object> getMyDuelStats(@org.springframework.data.repository.query.Param("userId") java.util.UUID userId);
}
