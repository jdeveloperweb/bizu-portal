package com.bizu.portal.content.api.dto;

import com.bizu.portal.content.domain.Question;
import lombok.Builder;
import lombok.Data;

import java.util.Map;
import java.util.UUID;

@Data
@Builder
public class PublicQuestionDTO {
    private UUID id;
    private String statement;
    private Map<String, Object> options;
    private String banca;
    private Integer year;
    private String subject;
    private String topic;
    private String difficulty;
    private String questionType;
    private String category;
    private String imageBase64;
    private UUID moduleId;

    public static PublicQuestionDTO fromEntity(Question question) {
        if (question == null) return null;
        return PublicQuestionDTO.builder()
                .id(question.getId())
                .statement(question.getStatement())
                .options(question.getOptions())
                .banca(question.getBanca())
                .year(question.getYear())
                .subject(question.getSubject())
                .topic(question.getTopic())
                .difficulty(question.getDifficulty())
                .questionType(question.getQuestionType())
                .category(question.getCategory())
                .imageBase64(question.getImageBase64())
                .moduleId(question.getModuleId())
                .build();
    }
}
