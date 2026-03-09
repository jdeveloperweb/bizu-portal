package com.bizu.portal.student.guild.api.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class GuildInviteDTO {
    private UUID id;
    private UUID guildId;
    private String guildName;
    private String badge;
    private String inviterName;
    private String createdAt;
}
