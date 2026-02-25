package com.bizu.portal.student.infrastructure;

import com.bizu.portal.student.domain.MaterialCompletion;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface MaterialCompletionRepository extends JpaRepository<MaterialCompletion, UUID> {
    Optional<MaterialCompletion> findByUserIdAndMaterialId(UUID userId, UUID materialId);
    List<MaterialCompletion> findByUserId(UUID userId);
}
