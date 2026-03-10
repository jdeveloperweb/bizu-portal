package com.bizu.portal.student.infrastructure.war;

import com.bizu.portal.student.domain.war.WarZoneAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WarZoneAttemptRepository extends JpaRepository<WarZoneAttempt, UUID> {

    List<WarZoneAttempt> findAllByZoneProgressId(UUID zoneProgressId);

    boolean existsByZoneProgressIdAndUserIdAndQuestionId(UUID progressId, UUID userId, UUID questionId);

    @Query("SELECT COUNT(a) FROM WarZoneAttempt a WHERE a.zoneProgress.id = :progressId AND a.userId = :userId")
    long countByProgressAndUser(@Param("progressId") UUID progressId, @Param("userId") UUID userId);

    @Query("SELECT SUM(a.pointsEarned) FROM WarZoneAttempt a WHERE a.zoneProgress.guildWarSession.id = :sessionId AND a.userId = :userId")
    Long sumPointsBySessionAndUser(@Param("sessionId") UUID sessionId, @Param("userId") UUID userId);

    @Query("SELECT COUNT(a) FROM WarZoneAttempt a WHERE a.zoneProgress.guildWarSession.warDayEvent.id = :eventId AND a.correct = true")
    long countCorrectByEventId(@Param("eventId") UUID eventId);
}
