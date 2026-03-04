package com.bizu.portal.commerce.api.dto;

import com.bizu.portal.commerce.domain.Plan;
import com.bizu.portal.content.api.dto.PublicCourseSlimDTO;
import lombok.Builder;
import lombok.Data;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
public class PublicPlanDTO {
    private UUID id;
    private String name;
    private String code;
    private String description;
    private BigDecimal price;
    private String currency;
    private String billingInterval;
    private boolean active;
    private boolean group;
    private int maxMembers;
    private int devicesPerUser;
    private PublicCourseSlimDTO course;
    private String features;
    private boolean highlight;
    private String badge;
    private int sortOrder;
    private boolean free;

    public static PublicPlanDTO fromEntity(Plan plan) {
        if (plan == null) return null;
        return PublicPlanDTO.builder()
                .id(plan.getId())
                .name(plan.getName())
                .code(plan.getCode())
                .description(plan.getDescription())
                .price(plan.getPrice())
                .currency(plan.getCurrency())
                .billingInterval(plan.getBillingInterval())
                .active(plan.isActive())
                .group(plan.isGroup())
                .maxMembers(plan.getMaxMembers())
                .devicesPerUser(plan.getDevicesPerUser())
                .course(PublicCourseSlimDTO.fromEntity(plan.getCourse()))
                .features(plan.getFeatures())
                .highlight(plan.isHighlight())
                .badge(plan.getBadge())
                .sortOrder(plan.getSortOrder())
                .free(plan.isFree())
                .build();
    }
}
