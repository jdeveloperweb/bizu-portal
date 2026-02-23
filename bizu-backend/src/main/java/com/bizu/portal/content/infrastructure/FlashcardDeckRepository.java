package com.bizu.portal.content.infrastructure;

import com.bizu.portal.content.domain.FlashcardDeck;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface FlashcardDeckRepository extends JpaRepository<FlashcardDeck, UUID> {
}
