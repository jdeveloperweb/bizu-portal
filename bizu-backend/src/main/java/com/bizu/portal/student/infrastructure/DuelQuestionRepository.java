package com.bizu.portal.student.infrastructure;

import com.bizu.portal.student.domain.DuelQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.UUID;

public interface DuelQuestionRepository extends JpaRepository<DuelQuestion, UUID> {
    DuelQuestion findByDuelIdAndRoundNumber(UUID duelId, int roundNumber);
}
