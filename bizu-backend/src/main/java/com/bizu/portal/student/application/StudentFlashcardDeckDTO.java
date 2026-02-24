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
}
