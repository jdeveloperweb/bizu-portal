package com.bizu.portal.student.infrastructure.war;

import com.bizu.portal.student.domain.war.WarMapTemplate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface WarMapTemplateRepository extends JpaRepository<WarMapTemplate, UUID> {
}
