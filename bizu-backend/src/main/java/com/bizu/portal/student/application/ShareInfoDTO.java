package com.bizu.portal.student.application;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ShareInfoDTO {
    private java.util.UUID deckId; // ID da cópia compartilhada
    private String name;
    private String avatarUrl;
    private String type; // "GUILD" or "USER"
}
