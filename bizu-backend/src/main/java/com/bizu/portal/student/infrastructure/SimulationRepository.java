package com.bizu.portal.student.infrastructure;

import com.bizu.portal.student.domain.SimulationSession;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SimulationRepository extends JpaRepository<SimulationSession, UUID> {
}
