package com.bizu.portal.student.infrastructure.war;

import com.bizu.portal.student.domain.war.WarZoneProgress;
import jakarta.persistence.LockModeType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Lock;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WarZoneProgressRepository extends JpaRepository<WarZoneProgress, UUID> {

    List<WarZoneProgress> findAllByGuildWarSessionId(UUID sessionId);

    Optional<WarZoneProgress> findByGuildWarSessionIdAndZoneTemplateId(UUID sessionId, UUID zoneTemplateId);

    @Lock(LockModeType.PESSIMISTIC_WRITE)
    @Query("SELECT p FROM WarZoneProgress p WHERE p.guildWarSession.id = :sessionId AND p.zoneTemplate.id = :zoneId")
    Optional<WarZoneProgress> findBySessionAndZoneForUpdate(
        @Param("sessionId") UUID sessionId,
        @Param("zoneId") UUID zoneId
    );

    long countByGuildWarSessionIdAndStatus(UUID sessionId, String status);
}
