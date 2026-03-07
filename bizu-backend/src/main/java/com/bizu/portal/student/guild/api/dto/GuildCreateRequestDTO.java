package com.bizu.portal.student.guild.api.dto;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class GuildCreateRequestDTO {
    private String name;
    private String description;
    private String badge;
    private boolean isPublic;
    private int maxMembers;
    private List<UUID> invitedUserIds;
}
