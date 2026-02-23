package com.bizu.portal.commerce.application;

import com.bizu.portal.commerce.domain.Plan;
import com.bizu.portal.commerce.infrastructure.PlanRepository;
import com.bizu.portal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class PlanService {

    private final PlanRepository planRepository;

    public List<Plan> findAll() {
        return planRepository.findAll();
    }

    public List<Plan> findAllActive() {
        return planRepository.findAllByActiveTrueOrderBySortOrder();
    }

    public List<Plan> findAllByCourse(UUID courseId) {
        return planRepository.findAllByCourseIdOrderBySortOrder(courseId);
    }

    public Plan findById(UUID id) {
        return planRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Plano não encontrado"));
    }

    @Transactional
    public Plan save(Plan plan) {
        return planRepository.save(plan);
    }

    @Transactional
    public void delete(UUID id) {
        Plan plan = findById(id);
        planRepository.delete(plan);
    }
}
