package com.bizu.portal.content.api;

import com.bizu.portal.content.application.QuestionService;
import com.bizu.portal.content.domain.Question;
import com.bizu.portal.shared.pagination.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public/questions")
@RequiredArgsConstructor
public class PublicQuestionController {

    private final QuestionService questionService;

    @GetMapping
    public ResponseEntity<PageResponse<Question>> searchQuestions(
            @RequestParam(required = false) String banca,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String category,
            @PageableDefault(size = 20) Pageable pageable) {
        
        return ResponseEntity.ok(questionService.search(banca, year, subject, topic, difficulty, category, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<Question> getQuestionById(@PathVariable UUID id) {
        return ResponseEntity.ok(questionService.findById(id));
    }
}
