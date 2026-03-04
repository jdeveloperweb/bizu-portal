package com.bizu.portal.commerce.infrastructure;

import com.bizu.portal.commerce.domain.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PlanRepository extends JpaRepository<Plan, UUID> {
    List<Plan> findAllByActiveTrueOrderBySortOrder();

    @Query("SELECT p FROM Plan p WHERE p.active = true AND p.code NOT LIKE concat(:codePrefix, '%') ORDER BY p.sortOrder")
    List<Plan> findAllByActiveTrueAndCodeNotStartingWithOrderBySortOrder(@Param("codePrefix") String codePrefix);
    List<Plan> findAllByCourseIdOrderBySortOrder(UUID courseId);
    java.util.Optional<Plan> findByCode(String code);
    List<Plan> findByCodeStartingWithAndActiveTrueOrderBySortOrderAsc(String prefix);
}
