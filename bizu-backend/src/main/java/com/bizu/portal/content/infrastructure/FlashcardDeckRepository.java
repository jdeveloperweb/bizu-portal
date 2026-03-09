package com.bizu.portal.content.infrastructure;

import com.bizu.portal.content.domain.FlashcardDeck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface FlashcardDeckRepository extends JpaRepository<FlashcardDeck, UUID> {
    List<FlashcardDeck> findAllByGuildIdOrderByCreatedAtDesc(UUID guildId);
    List<FlashcardDeck> findAllByIsForSaleTrue();
    List<FlashcardDeck> findAllByUserId(UUID userId);
}
