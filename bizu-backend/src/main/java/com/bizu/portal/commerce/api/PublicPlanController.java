package com.bizu.portal.commerce.api;

import com.bizu.portal.commerce.api.dto.PublicPlanDTO;
import com.bizu.portal.commerce.application.PlanService;
import com.bizu.portal.commerce.domain.Plan;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/public/plans")
@RequiredArgsConstructor
public class PublicPlanController {

    private final PlanService planService;

    @GetMapping
    public ResponseEntity<List<PublicPlanDTO>> getPlans(@RequestParam(required = false) UUID courseId) {
        List<Plan> plans;
        if (courseId != null) {
            plans = planService.findAllByCourse(courseId);
        } else {
            plans = planService.findAllActive();
        }
        
        List<PublicPlanDTO> response = plans.stream()
                .map(PublicPlanDTO::fromEntity)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<PublicPlanDTO> getPlan(@PathVariable UUID id) {
        Plan plan = planService.findById(id);
        return ResponseEntity.ok(PublicPlanDTO.fromEntity(plan));
    }
}
