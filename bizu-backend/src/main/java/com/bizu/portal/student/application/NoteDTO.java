package com.bizu.portal.student.application;

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
public class NoteDTO {
    private UUID id;
    private String title;
    private String content;
    private String subject;
    private UUID moduleId;
    private List<String> tags;
    private LinkedToDTO linkedTo;
    private boolean pinned;
    private boolean starred;
    private String createdAt;
    private String updatedAt;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class LinkedToDTO {
        private String type;
        private String label;
    }
}
