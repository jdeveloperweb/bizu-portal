package com.bizu.portal.student.guild.api.dto;
import com.fasterxml.jackson.annotation.JsonProperty;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class GuildResponseDTO {
    private UUID id;
    private String name;
    private String description;
    private String badge;
    private int memberCount;
    private int maxMembers;
    private long totalXp;
    private long weeklyXp;
    private int rankPosition;
    private String league;
    private int streak;
    @JsonProperty("isPublic")
    private boolean isPublic;

    @JsonProperty("isAdmin")
    private boolean isAdmin;

    @JsonProperty("isMember")
    private boolean isMember;

    @JsonProperty("isFounder")
    private boolean isFounder;

    @JsonProperty("hasPendingRequest")
    private boolean hasPendingRequest;
    
    private List<String> tags;
    private String createdAt;
    private long weeklyGoal;
    private double weeklyProgress;
}
