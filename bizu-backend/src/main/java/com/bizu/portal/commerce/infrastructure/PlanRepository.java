package com.bizu.portal.commerce.infrastructure;

import com.bizu.portal.commerce.domain.Plan;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface PlanRepository extends JpaRepository<Plan, UUID> {
    List<Plan> findAllByActiveTrueOrderBySortOrder();
    List<Plan> findAllByCourseIdOrderBySortOrder(UUID courseId);
    java.util.Optional<Plan> findByCode(String code);
}
