package com.bizu.portal.student.infrastructure;

import com.bizu.portal.student.domain.SimuladoSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SimuladoSessionRepository extends JpaRepository<SimuladoSession, UUID> {

    Optional<SimuladoSession> findByUser_IdAndSimulado_Id(UUID userId, UUID simuladoId);

    List<SimuladoSession> findAllByUser_IdOrderByStartedAtDesc(UUID userId);

    boolean existsByUser_IdAndSimulado_Id(UUID userId, UUID simuladoId);

    List<SimuladoSession> findAllBySimulado_IdOrderByStartedAtDesc(UUID simuladoId);
}
