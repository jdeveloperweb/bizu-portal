package com.bizu.portal.commerce.api;

import com.bizu.portal.commerce.application.PlanService;
import com.bizu.portal.commerce.domain.Plan;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/public/plans")
@RequiredArgsConstructor
public class PublicPlanController {

    private final PlanService planService;

    @GetMapping
    public ResponseEntity<List<Plan>> getPlans() {
        return ResponseEntity.ok(planService.findAllActive());
    }
}
