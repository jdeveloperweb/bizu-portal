package com.bizu.portal.content.application;

import com.bizu.portal.content.domain.Flashcard;
import com.bizu.portal.content.infrastructure.FlashcardRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class FlashcardService {

    private final FlashcardRepository flashcardRepository;

    public List<Flashcard> findByModule(UUID moduleId) {
        return flashcardRepository.findAllByModuleId(moduleId);
    }

    @Transactional
    public Flashcard save(Flashcard flashcard) {
        return flashcardRepository.save(flashcard);
    }
}
