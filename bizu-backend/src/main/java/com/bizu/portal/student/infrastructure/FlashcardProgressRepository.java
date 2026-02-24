package com.bizu.portal.student.infrastructure;

import com.bizu.portal.student.domain.FlashcardProgress;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FlashcardProgressRepository extends JpaRepository<FlashcardProgress, UUID> {
    
    Optional<FlashcardProgress> findByUserIdAndFlashcardId(UUID userId, UUID flashcardId);
    
    List<FlashcardProgress> findAllByUserId(UUID userId);

    @Query("SELECT COUNT(fp) FROM FlashcardProgress fp WHERE fp.user.id = :userId AND fp.nextReviewAt <= :now")
    long countDueByUserId(@Param("userId") UUID userId, @Param("now") OffsetDateTime now);

    @Query("SELECT COUNT(f) FROM Flashcard f WHERE f.deck.id = :deckId AND f.id NOT IN (SELECT fp.flashcard.id FROM FlashcardProgress fp WHERE fp.user.id = :userId)")
    long countNewByDeckAndUser(@Param("deckId") UUID deckId, @Param("userId") UUID userId);

    @Query("SELECT COUNT(fp) FROM FlashcardProgress fp JOIN fp.flashcard f WHERE f.deck.id = :deckId AND fp.user.id = :userId AND fp.nextReviewAt <= :now")
    long countDueByDeckAndUser(@Param("deckId") UUID deckId, @Param("userId") UUID userId, @Param("now") OffsetDateTime now);
}
