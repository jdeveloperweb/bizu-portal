package com.bizu.portal.student.infrastructure.war;

import com.bizu.portal.student.domain.war.WarZoneTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface WarZoneTemplateRepository extends JpaRepository<WarZoneTemplate, UUID> {

    List<WarZoneTemplate> findAllByMapTemplateIdOrderByDisplayOrderAsc(UUID mapTemplateId);

    @Query("SELECT z FROM WarZoneTemplate z WHERE z.mapTemplate.id = :mapId AND z.zoneType = 'BOSS'")
    java.util.Optional<WarZoneTemplate> findBossZoneByMapId(@Param("mapId") UUID mapId);
}
