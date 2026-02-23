package com.bizu.portal.content.infrastructure;

import com.bizu.portal.content.domain.Flashcard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FlashcardRepository extends JpaRepository<Flashcard, UUID> {
    List<Flashcard> findAllByModuleId(UUID moduleId);
}
