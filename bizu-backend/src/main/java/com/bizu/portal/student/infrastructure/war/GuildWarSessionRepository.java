package com.bizu.portal.student.infrastructure.war;

import com.bizu.portal.student.domain.war.GuildWarSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GuildWarSessionRepository extends JpaRepository<GuildWarSession, UUID> {

    Optional<GuildWarSession> findByWarDayEventIdAndGuildId(UUID eventId, UUID guildId);

    List<GuildWarSession> findAllByWarDayEventIdOrderByTotalScoreDesc(UUID eventId);

    @Query("SELECT s FROM GuildWarSession s JOIN FETCH s.guild WHERE s.warDayEvent.id = :eventId ORDER BY s.totalScore DESC")
    List<GuildWarSession> findRankingByEventId(@Param("eventId") UUID eventId);
}
