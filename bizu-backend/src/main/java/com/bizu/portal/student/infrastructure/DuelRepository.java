package com.bizu.portal.student.infrastructure;

import com.bizu.portal.student.domain.Duel;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DuelRepository extends JpaRepository<Duel, UUID> {
    List<Duel> findAllByOpponentIdAndStatus(UUID opponentId, String status);
}
