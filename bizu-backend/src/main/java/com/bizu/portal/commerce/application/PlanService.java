package com.bizu.portal.commerce.application;

import com.bizu.portal.commerce.domain.Plan;
import com.bizu.portal.commerce.infrastructure.PlanRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PlanService {

    private final PlanRepository planRepository;

    public List<Plan> findAllActive() {
        return planRepository.findAllByActiveTrue();
    }

    public Plan save(Plan plan) {
        return planRepository.save(plan);
    }
}
