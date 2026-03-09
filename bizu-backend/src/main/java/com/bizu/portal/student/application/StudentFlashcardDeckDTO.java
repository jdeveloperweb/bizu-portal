package com.bizu.portal.student.application;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class StudentFlashcardDeckDTO {
    private UUID id;
    private String title;
    private String description;
    private String icon;
    private String color;
    private long totalCards;
    private long newCards;
    private long dueCards;
    private int progress;
    private String lastStudied; // Relative string or date
    private String sharedWithGuildName; // Nome da guild se compartilhado
    private UUID userId;
    private UUID originalCreatorId;
    private String originalCreatorName;
    @com.fasterxml.jackson.annotation.JsonProperty("isForSale")
    private boolean isForSale;
    private Integer price;
    private Double rating;
    private Integer ratingCount;
    @com.fasterxml.jackson.annotation.JsonProperty("isPurchased")
    private boolean isPurchased;
    private UUID guildId;
    private java.util.List<ShareInfoDTO> sharedWith;
}
