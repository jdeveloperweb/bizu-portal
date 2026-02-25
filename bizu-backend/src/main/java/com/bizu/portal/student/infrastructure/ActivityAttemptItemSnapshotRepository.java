package com.bizu.portal.student.infrastructure;

import com.bizu.portal.student.domain.ActivityAttemptItemSnapshot;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.UUID;

public interface ActivityAttemptItemSnapshotRepository extends JpaRepository<ActivityAttemptItemSnapshot, UUID> {

    List<ActivityAttemptItemSnapshot> findByAttemptIdOrderByQuestionOrder(UUID attemptId);
}
