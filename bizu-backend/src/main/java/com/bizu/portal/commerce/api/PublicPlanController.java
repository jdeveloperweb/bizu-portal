package com.bizu.portal.commerce.api;

import com.bizu.portal.commerce.application.PlanService;
import com.bizu.portal.commerce.domain.Plan;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public/plans")
@RequiredArgsConstructor
public class PublicPlanController {

    private final PlanService planService;

    @GetMapping
    public ResponseEntity<List<Plan>> getPlans(@RequestParam(required = false) UUID courseId) {
        if (courseId != null) {
            return ResponseEntity.ok(planService.findAllByCourse(courseId));
        }
        return ResponseEntity.ok(planService.findAllActive());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Plan> getPlan(@PathVariable UUID id) {
        return ResponseEntity.ok(planService.findById(id));
    }
}
