package com.bizu.portal.student.infrastructure.war;

import com.bizu.portal.student.domain.war.WarDayEvent;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface WarDayEventRepository extends JpaRepository<WarDayEvent, UUID> {

    List<WarDayEvent> findAllByStatusOrderByStartAtDesc(String status);

    @Query("SELECT e FROM WarDayEvent e WHERE e.status = 'ACTIVE'")
    Optional<WarDayEvent> findActiveEvent();

    @Query("SELECT e FROM WarDayEvent e WHERE e.status = 'UPCOMING' AND e.startAt <= :now")
    List<WarDayEvent> findEventsToStart(@Param("now") OffsetDateTime now);

    @Query("SELECT e FROM WarDayEvent e WHERE e.status = 'ACTIVE' AND e.endAt <= :now")
    List<WarDayEvent> findEventsToEnd(@Param("now") OffsetDateTime now);

    @Query("SELECT e FROM WarDayEvent e WHERE e.status IN ('UPCOMING', 'ACTIVE') ORDER BY e.startAt ASC")
    List<WarDayEvent> findUpcomingAndActive();
}
