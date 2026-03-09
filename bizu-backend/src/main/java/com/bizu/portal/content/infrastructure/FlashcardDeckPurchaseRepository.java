package com.bizu.portal.content.infrastructure;

import com.bizu.portal.content.domain.FlashcardDeckPurchase;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FlashcardDeckPurchaseRepository extends JpaRepository<FlashcardDeckPurchase, UUID> {
    List<FlashcardDeckPurchase> findAllByStudentId(UUID studentId);
    boolean existsByDeckIdAndStudentId(UUID deckId, UUID studentId);
    List<FlashcardDeckPurchase> findAllByDeckIdIn(List<UUID> deckIds);
    void deleteByDeckIdAndStudentId(UUID deckId, UUID studentId);
}
