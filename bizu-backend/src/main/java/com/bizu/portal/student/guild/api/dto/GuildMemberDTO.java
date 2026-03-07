package com.bizu.portal.student.guild.api.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class GuildMemberDTO {
    private UUID id;
    private String name;
    private String nickname;
    private int level;
    private long xp;
    private String role;
    private int streak;
    private String joinDate;
    private String avatar;
    private boolean online;
}
