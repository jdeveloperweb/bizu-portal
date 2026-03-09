package com.bizu.portal.student.guild.api.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuildUpdateRequestDTO {
    private String name;
    private String description;
    private String badge;
    private Boolean isPublic;
    private Integer maxMembers;
    private Long weeklyGoal;
}
