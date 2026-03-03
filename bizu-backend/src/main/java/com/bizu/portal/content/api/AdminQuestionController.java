package com.bizu.portal.content.api;

import com.bizu.portal.content.application.QuestionImportService;
import com.bizu.portal.content.application.QuestionService;
import com.bizu.portal.content.domain.Question;
import com.bizu.portal.content.domain.QuestionImportLog;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ContentDisposition;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/questions")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
public class AdminQuestionController {

    private final QuestionService questionService;
    private final QuestionImportService questionImportService;

    @GetMapping
    public ResponseEntity<com.bizu.portal.shared.pagination.PageResponse<Question>> listQuestions(
            @RequestParam(required = false) String category,
            @RequestParam(required = false) String search,
            @org.springframework.data.web.PageableDefault(size = 20) org.springframework.data.domain.Pageable pageable) {
        return ResponseEntity.ok(questionService.searchByCategory(category, search, pageable));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats(@RequestParam String category) {
        return ResponseEntity.ok(questionService.getStats(category));
    }

    @GetMapping("/subjects")
    public ResponseEntity<List<String>> getSubjects(@RequestParam String category) {
        return ResponseEntity.ok(questionService.getSubjects(category));
    }

    @GetMapping("/bancas")
    public ResponseEntity<List<String>> getBancas(@RequestParam String category) {
        return ResponseEntity.ok(questionService.getBancas(category));
    }

    @GetMapping("/topics")
    public ResponseEntity<List<String>> getTopics(@RequestParam String category) {
        return ResponseEntity.ok(questionService.getTopics(category));
    }

    // ── Bulk Import ──────────────────────────────────────────────────────────

    @GetMapping("/import/template")
    public ResponseEntity<byte[]> downloadTemplate(
            @RequestParam(required = false) String courseId,
            @RequestParam(required = false) String courseTitle,
            @RequestParam(required = false) String moduleId,
            @RequestParam(required = false) String moduleTitle,
            @RequestParam(defaultValue = "QUIZ") String category) {

        String json = questionImportService.generateTemplate(courseId, courseTitle, moduleId, moduleTitle, category);
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);
        String filename = "template_questoes_" + category.toLowerCase() + ".json";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setContentDisposition(ContentDisposition.attachment().filename(filename).build());

        return ResponseEntity.ok().headers(headers).body(bytes);
    }

    @PostMapping("/import/json")
    public ResponseEntity<Map<String, Object>> importJson(
            @RequestParam("file") MultipartFile file,
            Authentication authentication) {

        String importedBy = authentication != null ? authentication.getName() : "admin";
        Map<String, Object> result = questionImportService.importFromJson(file, importedBy);
        return ResponseEntity.ok(result);
    }

    @GetMapping("/import/logs")
    public ResponseEntity<List<QuestionImportLog>> getImportLogs() {
        return ResponseEntity.ok(questionImportService.getLogs());
    }

    @GetMapping("/import/logs/{id}/file")
    public ResponseEntity<byte[]> downloadImportFile(@PathVariable UUID id) {
        String json = questionImportService.getLogFile(id);
        byte[] bytes = json.getBytes(StandardCharsets.UTF_8);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setContentDisposition(ContentDisposition.attachment().filename("import_" + id + ".json").build());

        return ResponseEntity.ok().headers(headers).body(bytes);
    }

    // ── CRUD ─────────────────────────────────────────────────────────────────

    @PostMapping
    public ResponseEntity<Question> createQuestion(@RequestBody Question question) {
        return ResponseEntity.ok(questionService.save(question));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestion(@PathVariable UUID id) {
        return ResponseEntity.ok(questionService.findById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Question> updateQuestion(@PathVariable UUID id, @RequestBody Question question) {
        Question existing = questionService.findById(id);
        existing.setStatement(question.getStatement());
        existing.setImageBase64(question.getImageBase64());
        existing.setOptions(question.getOptions());
        existing.setCorrectOption(question.getCorrectOption());
        existing.setResolution(question.getResolution());
        existing.setBanca(question.getBanca());
        existing.setYear(question.getYear());
        existing.setSubject(question.getSubject());
        existing.setTopic(question.getTopic());
        existing.setDifficulty(question.getDifficulty());
        existing.setQuestionType(question.getQuestionType());
        existing.setCategory(question.getCategory());
        if (question.getModule() != null) {
            existing.setModule(question.getModule());
        }
        return ResponseEntity.ok(questionService.save(existing));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable UUID id) {
        questionService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/module/{moduleId}")
    public ResponseEntity<Void> deleteAllByModule(@PathVariable UUID moduleId) {
        questionService.deleteAllByModule(moduleId);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/topic")
    public ResponseEntity<Void> deleteAllByTopic(@RequestParam String topic) {
        questionService.deleteAllByTopic(topic);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/subject")
    public ResponseEntity<Void> deleteAllBySubject(@RequestParam String subject) {
        questionService.deleteAllBySubject(subject);
        return ResponseEntity.noContent().build();
    }
}
