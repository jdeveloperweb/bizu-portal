package com.bizu.portal.student.guild.api.dto;
import com.fasterxml.jackson.annotation.JsonProperty;

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
    @JsonProperty("isPublic")
    private Boolean isPublic;
    private Integer maxMembers;
    private Long weeklyGoal;
}
