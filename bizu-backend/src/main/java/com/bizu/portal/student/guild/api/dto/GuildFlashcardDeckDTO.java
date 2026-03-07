package com.bizu.portal.student.guild.api.dto;

import lombok.Builder;
import lombok.Data;
import java.util.UUID;

@Data
@Builder
public class GuildFlashcardDeckDTO {
    private UUID id;
    private String title;
    private String description;
    private String icon;
    private String color;
    private int cardCount;
}
