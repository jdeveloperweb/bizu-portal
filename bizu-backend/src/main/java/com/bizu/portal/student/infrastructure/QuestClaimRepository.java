package com.bizu.portal.student.infrastructure;

import com.bizu.portal.student.domain.QuestClaim;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.UUID;

public interface QuestClaimRepository extends JpaRepository<QuestClaim, QuestClaim.QuestClaimId> {
    List<QuestClaim> findAllByUserIdAndPeriodId(UUID userId, String periodId);
    boolean existsByUserIdAndQuestCodeAndPeriodId(UUID userId, String questCode, String periodId);
}
