package com.bizu.portal.student.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class BadgeDTO {
    private UUID id;
    private String name;
    private String description;
    private String icon;
    private boolean earned;
    private String category;
    private int xp;
    private OffsetDateTime earnedDate;
    private int progress;
    private String requirement;
    private String color;
}
