package com.bizu.portal.student.infrastructure.war;

import com.bizu.portal.student.domain.war.WarDayRanking;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WarDayRankingRepository extends JpaRepository<WarDayRanking, UUID> {

    List<WarDayRanking> findAllByWarDayEventIdOrderByFinalPositionAsc(UUID eventId);

    Optional<WarDayRanking> findByWarDayEventIdAndGuildId(UUID eventId, UUID guildId);
}
