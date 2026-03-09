package com.bizu.portal.student.guild.api.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class GuildRequestDTO {
    private UUID id;
    private String name;
    private String nickname;
    private String avatar;
    private int level;
    private String message;
}

