package com.bizu.portal.content.application;

import com.bizu.portal.content.domain.Module;
import com.bizu.portal.content.domain.Question;
import com.bizu.portal.content.domain.QuestionImportLog;
import com.bizu.portal.content.infrastructure.ModuleRepository;
import com.bizu.portal.content.infrastructure.QuestionImportLogRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuestionImportService {

    private final QuestionService questionService;
    private final QuestionImportLogRepository importLogRepository;
    private final ModuleRepository moduleRepository;
    private final ObjectMapper objectMapper;

    /**
     * Generate a JSON template for bulk question import.
     * Pre-fills course and module information so the user only needs to add questions.
     */
    public String generateTemplate(String courseId, String courseTitle, String moduleId, String moduleTitle, String category) {
        Map<String, Object> template = new HashMap<>();
        template.put("course", courseTitle);
        template.put("courseId", courseId);
        template.put("module", moduleTitle);
        template.put("moduleId", moduleId);
        template.put("category", category);

        List<Map<String, Object>> examples = new ArrayList<>();
        for (int i = 1; i <= 3; i++) {
            Map<String, Object> q = new HashMap<>();
            q.put("statement", "Exemplo " + i + ": Enunciado da questão aqui. Pode conter **markdown**.");
            q.put("imageBase64", null);
            Map<String, String> opts = new HashMap<>();
            opts.put("A", "Alternativa A");
            opts.put("B", "Alternativa B");
            opts.put("C", "Alternativa C");
            opts.put("D", "Alternativa D");
            q.put("options", opts);
            q.put("correctOption", "A");
            q.put("resolution", "Explicação detalhada da resposta correta.");
            q.put("banca", "VUNESP");
            q.put("year", 2024);
            q.put("subject", "Disciplina");
            q.put("topic", "Assunto específico");
            q.put("difficulty", "EASY");
            examples.add(q);
        }
        template.put("questions", examples);

        try {
            return objectMapper.writerWithDefaultPrettyPrinter().writeValueAsString(template);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar template JSON", e);
        }
    }

    /**
     * Import questions from a JSON file. Records the import in the audit log.
     */
    @Transactional
    public Map<String, Object> importFromJson(MultipartFile file, String importedBy) {
        String jsonContent;
        try {
            jsonContent = new String(file.getBytes(), StandardCharsets.UTF_8);
        } catch (Exception e) {
            throw new RuntimeException("Erro ao ler o arquivo: " + e.getMessage());
        }

        JsonNode root;
        try {
            root = objectMapper.readTree(jsonContent);
        } catch (Exception e) {
            throw new RuntimeException("Arquivo JSON inválido: " + e.getMessage());
        }

        String courseId = root.path("courseId").asText(null);
        String courseTitle = root.path("course").asText(null);
        String moduleId = root.path("moduleId").asText(null);
        String moduleTitle = root.path("module").asText(null);
        String category = root.path("category").asText("QUIZ");

        Module module = null;
        if (moduleId != null && !moduleId.isBlank()) {
            try {
                module = moduleRepository.findById(UUID.fromString(moduleId)).orElse(null);
            } catch (Exception e) {
                log.warn("Module not found for id: {}", moduleId);
            }
        }

        JsonNode questionsNode = root.path("questions");
        if (!questionsNode.isArray()) {
            throw new RuntimeException("O JSON deve conter um array 'questions'.");
        }

        List<String> errors = new ArrayList<>();
        int count = 0;

        for (int i = 0; i < questionsNode.size(); i++) {
            JsonNode qNode = questionsNode.get(i);
            try {
                Map<String, Object> options = new HashMap<>();
                JsonNode optsNode = qNode.path("options");
                optsNode.fields().forEachRemaining(entry -> options.put(entry.getKey(), entry.getValue().asText()));

                Question question = Question.builder()
                        .statement(qNode.path("statement").asText())
                        .imageBase64(qNode.path("imageBase64").isNull() ? null : qNode.path("imageBase64").asText(null))
                        .options(options)
                        .correctOption(qNode.path("correctOption").asText("A").toUpperCase())
                        .resolution(qNode.path("resolution").asText(null))
                        .banca(qNode.path("banca").asText(null))
                        .year(qNode.path("year").asInt(0) == 0 ? null : qNode.path("year").asInt())
                        .subject(qNode.path("subject").asText(null))
                        .topic(qNode.path("topic").asText(null))
                        .difficulty(qNode.path("difficulty").asText("EASY").toUpperCase())
                        .questionType("MULTIPLE_CHOICE")
                        .category(category)
                        .module(module)
                        .build();

                questionService.save(question);
                count++;
            } catch (Exception e) {
                errors.add("Questão " + (i + 1) + ": " + e.getMessage());
                log.error("Error importing question {}: {}", i + 1, e.getMessage());
            }
        }

        // Record import log
        QuestionImportLog importLog = QuestionImportLog.builder()
                .courseId(courseId != null ? tryParseUUID(courseId) : null)
                .courseTitle(courseTitle)
                .moduleId(moduleId != null ? tryParseUUID(moduleId) : null)
                .moduleTitle(moduleTitle)
                .category(category)
                .questionCount(count)
                .fileName(file.getOriginalFilename())
                .originalJson(jsonContent)
                .importedBy(importedBy)
                .build();
        importLogRepository.save(importLog);

        Map<String, Object> result = new HashMap<>();
        result.put("count", count);
        result.put("errors", errors);
        result.put("logId", importLog.getId());
        return result;
    }

    public List<QuestionImportLog> getLogs() {
        return importLogRepository.findAllByOrderByImportedAtDesc();
    }

    public String getLogFile(UUID logId) {
        QuestionImportLog log = importLogRepository.findById(logId)
                .orElseThrow(() -> new RuntimeException("Log não encontrado"));
        return log.getOriginalJson();
    }

    private UUID tryParseUUID(String value) {
        try {
            return UUID.fromString(value);
        } catch (Exception e) {
            return null;
        }
    }
}
