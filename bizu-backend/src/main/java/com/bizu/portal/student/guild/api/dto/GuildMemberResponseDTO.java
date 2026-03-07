package com.bizu.portal.student.guild.api.dto;

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
public class GuildMemberResponseDTO {
    private List<GuildMemberDTO> members;
    private List<GuildRequestDTO> pendingRequests;
}
