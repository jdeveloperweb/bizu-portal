package com.bizu.portal.student.guild.api.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class GuildFlashcardDTO {
    private UUID id;
    private String front;
    private String back;
}
创新 DTO for deck/note/task creation too.
