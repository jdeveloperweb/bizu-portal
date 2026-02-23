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
            String banca, Integer year, String subject, String topic, String difficulty, String category, Pageable pageable) {
        
        Page<Question> page = questionRepository.findByFilters(banca, year, subject, topic, difficulty, category, pageable);
        
        return PageResponse.<Question>builder()
            .content(page.getContent())
            .pageNumber(page.getNumber())
            .pageSize(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .last(page.isLast())
            .build();
    }

    public PageResponse<Question> searchByCategory(String category, String search, Pageable pageable) {
        Page<Question> page = (search == null || search.trim().isEmpty()) 
            ? questionRepository.findByCategory(category, pageable)
            : questionRepository.searchByCategory(category, search, pageable);

        return PageResponse.<Question>builder()
            .content(page.getContent())
            .pageNumber(page.getNumber())
            .pageSize(page.getSize())
            .totalElements(page.getTotalElements())
            .totalPages(page.getTotalPages())
            .last(page.isLast())
            .build();
    }

    public java.util.Map<String, Object> getStats(String category) {
        java.util.Map<String, Object> stats = new java.util.HashMap<>();
        stats.put("total", questionRepository.countByCategory(category));
        stats.put("easy", questionRepository.countByCategoryAndDifficulty(category, "EASY"));
        stats.put("medium", questionRepository.countByCategoryAndDifficulty(category, "MEDIUM"));
        stats.put("hard", questionRepository.countByCategoryAndDifficulty(category, "HARD"));
        return stats;
    }

    public java.util.List<String> getSubjects(String category) {
        return questionRepository.findDistinctSubjectsByCategory(category);
    }

    public java.util.List<String> getBancas(String category) {
        return questionRepository.findDistinctBancasByCategory(category);
    }

    public Question findById(UUID id) {
        return questionRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Questão não encontrada"));
    }

    @Transactional
    public void delete(UUID id) {
        questionRepository.deleteById(id);
    }

    @Transactional
    public Question save(Question question) {
        return questionRepository.save(question);
    }
}
