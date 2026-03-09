package com.bizu.portal.content.infrastructure;

import com.bizu.portal.content.domain.FlashcardDeckRating;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FlashcardDeckRatingRepository extends JpaRepository<FlashcardDeckRating, UUID> {
    List<FlashcardDeckRating> findAllByDeckId(UUID deckId);
    boolean existsByDeckIdAndStudentId(UUID deckId, UUID studentId);
}
