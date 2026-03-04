package com.bizu.portal.content.api;

import com.bizu.portal.content.api.dto.PublicQuestionDTO;
import com.bizu.portal.content.application.QuestionService;
import com.bizu.portal.content.domain.Question;
import com.bizu.portal.shared.pagination.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/public/questions")
@RequiredArgsConstructor
public class PublicQuestionController {

    private final QuestionService questionService;

    @GetMapping
    public ResponseEntity<PageResponse<PublicQuestionDTO>> searchQuestions(
            @RequestParam(required = false) String banca,
            @RequestParam(required = false) Integer year,
            @RequestParam(required = false) String subject,
            @RequestParam(required = false) String topic,
            @RequestParam(required = false) String difficulty,
            @RequestParam(required = false) String category,
            @PageableDefault(size = 20) Pageable pageable) {
        
        PageResponse<Question> result = questionService.search(banca, year, subject, topic, difficulty, category, pageable);
        
        List<PublicQuestionDTO> dtos = result.getContent().stream()
                .map(PublicQuestionDTO::fromEntity)
                .collect(Collectors.toList());
                
        return ResponseEntity.ok(PageResponse.<PublicQuestionDTO>builder()
                .content(dtos)
                .totalElements(result.getTotalElements())
                .totalPages(result.getTotalPages())
                .pageNumber(result.getPageNumber())
                .pageSize(result.getPageSize())
                .last(result.isLast())
                .build());
    }

    @GetMapping("/{id}")
    public ResponseEntity<PublicQuestionDTO> getQuestionById(@PathVariable UUID id) {
        Question question = questionService.findById(id);
        return ResponseEntity.ok(PublicQuestionDTO.fromEntity(question));
    }
}
