package com.bizu.portal.student.application;

import lombok.Data;
import java.util.List;
import java.util.UUID;

@Data
public class UpdateNoteRequest {
    private String title;
    private String content;
    private UUID moduleId;
    private List<String> tags;
    private LinkedToDTO linkedTo;
    private boolean pinned;
    private boolean starred;

    @Data
    public static class LinkedToDTO {
        private String type;
        private String label;
    }
}
