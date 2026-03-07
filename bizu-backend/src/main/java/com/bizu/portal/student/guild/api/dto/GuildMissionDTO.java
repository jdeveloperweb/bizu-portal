package com.bizu.portal.student.guild.api.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class GuildMissionDTO {
    private UUID id;
    private String title;
    private String type;
    private String description;
    private int progress;
    private int total;
    private int xpReward;
    private String endsAt;
    private boolean completed;
}
