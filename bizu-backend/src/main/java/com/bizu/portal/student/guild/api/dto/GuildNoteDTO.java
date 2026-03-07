package com.bizu.portal.student.guild.api.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class GuildNoteDTO {
    private UUID id;
    private String title;
    private String content;
    private String author;
    private String updatedAt;
}
