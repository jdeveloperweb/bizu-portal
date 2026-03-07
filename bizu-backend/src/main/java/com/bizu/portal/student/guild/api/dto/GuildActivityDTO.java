package com.bizu.portal.student.guild.api.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class GuildActivityDTO {
    private UUID id;
    private String user;
    private String action;
    private int xp;
    private String time;
}
