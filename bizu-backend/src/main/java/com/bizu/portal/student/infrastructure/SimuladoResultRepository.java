package com.bizu.portal.student.infrastructure;

import com.bizu.portal.student.domain.SimuladoResult;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface SimuladoResultRepository extends JpaRepository<SimuladoResult, UUID> {
    List<SimuladoResult> findAllByCompletedAtAfter(OffsetDateTime date);
}
