package com.bizu.portal.content.api;

import com.bizu.portal.content.domain.FlashcardDeck;
import com.bizu.portal.content.infrastructure.FlashcardDeckRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/flashcards")
@RequiredArgsConstructor
public class FlashcardController {

    private final FlashcardDeckRepository deckRepository;

    @GetMapping("/decks")
    public ResponseEntity<List<FlashcardDeck>> getAllDecks() {
        return ResponseEntity.ok(deckRepository.findAll());
    }

    @GetMapping("/decks/{id}")
    public ResponseEntity<FlashcardDeck> getDeckById(@PathVariable UUID id) {
        return deckRepository.findById(id)
            .map(ResponseEntity::ok)
            .orElse(ResponseEntity.notFound().build());
    }
}
