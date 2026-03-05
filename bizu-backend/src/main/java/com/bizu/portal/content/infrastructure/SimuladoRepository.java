package com.bizu.portal.content.infrastructure;

import com.bizu.portal.content.domain.Simulado;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface SimuladoRepository extends JpaRepository<Simulado, UUID> {
    @org.springframework.data.jpa.repository.Query("SELECT s FROM Simulado s LEFT JOIN FETCH s.questions WHERE s.id = :id")
    java.util.Optional<Simulado> findByIdWithQuestions(java.util.UUID id);

    List<Simulado> findAllByCourseIdIn(List<UUID> courseIds);
    List<Simulado> findAllByCourseIsNull();
}
