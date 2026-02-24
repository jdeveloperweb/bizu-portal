package com.bizu.portal.student.infrastructure;

import com.bizu.portal.student.domain.Duel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DuelRepository extends JpaRepository<Duel, UUID> {
    List<Duel> findAllByOpponentIdAndStatus(UUID opponentId, String status);

    @Query(value = "SELECT u.id, u.full_name as name, COUNT(d.id) as wins " +
                   "FROM identity.users u " +
                   "JOIN student.duels d ON u.id = d.winner_id " +
                   "GROUP BY u.id, u.full_name " +
                   "ORDER BY wins DESC LIMIT 10", nativeQuery = true)
    List<Object[]> getRanking();
}
