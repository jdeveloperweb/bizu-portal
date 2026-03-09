package com.bizu.portal.student.guild.api.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class GuildMessageDTO {
    private UUID id;
    private String user;
    private String avatar;
    private String text;
    private String time;
    private boolean isMe;
}

