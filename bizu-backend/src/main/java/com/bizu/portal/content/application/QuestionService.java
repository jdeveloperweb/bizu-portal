package com.bizu.portal.content.application;

import com.bizu.portal.content.domain.Question;
import com.bizu.portal.content.infrastructure.QuestionRepository;
import com.bizu.portal.shared.exception.ResourceNotFoundException;
import com.bizu.portal.shared.pagination.PageResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class QuestionService {

    private final QuestionRepository questionRepository;

    public PageResponse<Question> search(
            String banca, Integer year, String subject, String topic, String difficulty, Pageable pageable) {
        
        Page<Question> page = questionRepository.findByFilters(banca, year, subject, topic, difficulty, pageable);
        
        return PageResponse.<Question>builder()
            .content(page.getContent())
            .pageNumber(page.getNumber())
            .pageSize(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .last(page.isLast())
            .build();
    }

    public Question findById(UUID id) {
        return questionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Questão não encontrada"));
    }

    @Transactional
    public Question save(Question question) {
        return questionRepository.save(question);
    }
}
