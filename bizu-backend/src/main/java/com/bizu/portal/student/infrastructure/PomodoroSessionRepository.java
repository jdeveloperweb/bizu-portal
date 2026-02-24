package com.bizu.portal.student.infrastructure;

import com.bizu.portal.student.domain.PomodoroSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PomodoroSessionRepository extends JpaRepository<PomodoroSession, UUID> {
    
    List<PomodoroSession> findByUserIdOrderByCompletedAtDesc(UUID userId);

    @Query("SELECT p FROM PomodoroSession p WHERE p.user.id = :userId AND p.completedAt >= :start AND p.completedAt <= :end ORDER BY p.completedAt DESC")
    List<PomodoroSession> findByUserIdAndCompletedAtBetweenOrderByCompletedAtDesc(
        @Param("userId") UUID userId, 
        @Param("start") OffsetDateTime start, 
        @Param("end") OffsetDateTime end
    );
}
