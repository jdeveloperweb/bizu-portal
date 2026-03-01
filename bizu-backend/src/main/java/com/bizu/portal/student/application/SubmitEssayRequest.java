package com.bizu.portal.student.application;

import lombok.Data;
import java.util.UUID;

@Data
public class SubmitEssayRequest {
    private UUID courseId;
    private String title;
    private String content;
    private String attachmentUrl;
    private String type; // TEXT, IMAGE, PDF
    private String topic;
}
