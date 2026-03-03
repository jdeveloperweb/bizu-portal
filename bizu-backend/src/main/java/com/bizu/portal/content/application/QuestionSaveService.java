package com.bizu.portal.content.application;

import com.bizu.portal.content.domain.Module;
import com.bizu.portal.content.domain.Question;
import com.bizu.portal.content.infrastructure.QuestionRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuestionSaveService {

    private final QuestionRepository questionRepository;
    private final ObjectMapper objectMapper;

    @PersistenceContext
    private EntityManager entityManager;

    @Transactional
    public List<Question> parseAndSave(String aiResponse, UUID moduleId, String category, String subject) {
        try {
            String json = extractJson(aiResponse);
            JsonNode root = objectMapper.readTree(json);
            JsonNode questionsNode = root.get("questions");

            if (questionsNode == null || !questionsNode.isArray()) {
                log.warn("AI response did not contain a 'questions' array. Response snippet: {}",
                        aiResponse != null ? aiResponse.substring(0, Math.min(200, aiResponse.length())) : "null");
                return List.of();
            }

            Module moduleRef = (moduleId != null) ? entityManager.getReference(Module.class, moduleId) : null;

            List<Question> saved = new ArrayList<>();
            for (JsonNode qNode : questionsNode) {
                try {
                    Map<String, Object> options = new LinkedHashMap<>();
                    JsonNode optionsNode = qNode.get("options");
                    if (optionsNode != null) {
                        optionsNode.fields().forEachRemaining(e -> options.put(e.getKey(), e.getValue().asText()));
                    }

                    String difficulty = qNode.path("difficulty").asText("MEDIUM").toUpperCase();
                    if (!List.of("EASY", "MEDIUM", "HARD").contains(difficulty)) difficulty = "MEDIUM";

                    Question q = Question.builder()
                            .statement(qNode.path("statement").asText())
                            .options(options)
                            .correctOption(qNode.path("correctOption").asText())
                            .resolution(qNode.path("resolution").asText())
                            .difficulty(difficulty)
                            .topic("")
                            .subject(subject)
                            .questionType("MULTIPLE_CHOICE")
                            .category(category)
                            .module(moduleRef)
                            .build();

                    saved.add(questionRepository.save(q));
                } catch (Exception e) {
                    log.warn("Skipped one question due to parse/save error: {}", e.getMessage());
                }
            }

            log.info("Saved {}/{} questions for module {}", saved.size(), questionsNode.size(), moduleId);
            return saved;

        } catch (Exception e) {
            log.error("Failed to parse AI response into questions: {}", e.getMessage());
            return List.of();
        }
    }

    // ── JSON Extraction ───────────────────────────────────────────────────────

    private String extractJson(String response) {
        if (response == null || response.isBlank()) return "{}";

        // Handle ```json ... ``` markdown code blocks
        if (response.contains("```json")) {
            int start = response.indexOf("```json") + 7;
            int end = response.lastIndexOf("```");
            if (end > start) return response.substring(start, end).trim();
        }
        if (response.contains("```")) {
            int start = response.indexOf("```") + 3;
            int end = response.lastIndexOf("```");
            if (end > start) return response.substring(start, end).trim();
        }

        // Find the outermost JSON object
        int start = response.indexOf('{');
        int end = response.lastIndexOf('}');
        if (start >= 0 && end > start) return response.substring(start, end + 1);

        return response;
    }
}
