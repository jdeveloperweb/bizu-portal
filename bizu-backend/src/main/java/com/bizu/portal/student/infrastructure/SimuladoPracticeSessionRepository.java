package com.bizu.portal.student.infrastructure;

import com.bizu.portal.student.domain.SimuladoPracticeSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SimuladoPracticeSessionRepository extends JpaRepository<SimuladoPracticeSession, UUID> {

    Optional<SimuladoPracticeSession> findTopByUser_IdAndSimulado_IdAndStatusOrderByStartedAtDesc(
            UUID userId, UUID simuladoId, String status);

    List<SimuladoPracticeSession> findAllByStatusAndExpiresAtBefore(String status, OffsetDateTime time);
}
