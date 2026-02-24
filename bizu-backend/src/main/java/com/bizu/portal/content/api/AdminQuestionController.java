package com.bizu.portal.content.api;

import com.bizu.portal.content.application.QuestionImportService;
import com.bizu.portal.content.application.QuestionService;
import com.bizu.portal.content.domain.Question;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
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
    public ResponseEntity<java.util.Map<String, Object>> getStats(@RequestParam String category) {
        return ResponseEntity.ok(questionService.getStats(category));
    }

    @GetMapping("/subjects")
    public ResponseEntity<java.util.List<String>> getSubjects(@RequestParam String category) {
        return ResponseEntity.ok(questionService.getSubjects(category));
    }

    @GetMapping("/bancas")
    public ResponseEntity<java.util.List<String>> getBancas(@RequestParam String category) {
        return ResponseEntity.ok(questionService.getBancas(category));
    }

    @PostMapping("/import")
    public ResponseEntity<Map<String, Object>> importQuestions(@RequestParam("file") MultipartFile file) {
        int count = questionImportService.importFromCsv(file);
        Map<String, Object> response = new HashMap<>();
        response.put("message", "Sucesso");
        response.put("count", count);
        return ResponseEntity.ok(response);
    }

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
        question.setId(existing.getId());
        return ResponseEntity.ok(questionService.save(question));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable UUID id) {
        questionService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
