package com.bizu.portal.student.api;

import com.bizu.portal.content.domain.Flashcard;
import com.bizu.portal.content.domain.FlashcardDeck;
import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.student.application.StudentFlashcardDeckDTO;
import com.bizu.portal.student.application.StudentFlashcardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/flashcards")
@RequiredArgsConstructor
public class StudentFlashcardController {

    private final StudentFlashcardService studentFlashcardService;
    private final UserService userService;

    @GetMapping("/decks")
    public ResponseEntity<List<StudentFlashcardDeckDTO>> getDecks(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = resolveUserId(jwt);
        return ResponseEntity.ok(studentFlashcardService.getDecksForUser(userId));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = resolveUserId(jwt);
        List<StudentFlashcardDeckDTO> decks = studentFlashcardService.getDecksForUser(userId);
        
        long totalDue = decks.stream().mapToLong(StudentFlashcardDeckDTO::getDueCards).sum();
        long totalNew = decks.stream().mapToLong(StudentFlashcardDeckDTO::getNewCards).sum();
        long totalCards = decks.stream().mapToLong(StudentFlashcardDeckDTO::getTotalCards).sum();
        double avgProgress = decks.isEmpty() ? 0 : decks.stream().mapToInt(StudentFlashcardDeckDTO::getProgress).average().orElse(0);

        Map<String, Object> summary = new HashMap<>();
        summary.put("totalDue", totalDue);
        summary.put("totalNew", totalNew);
        summary.put("totalCards", totalCards);
        summary.put("avgProgress", (int)avgProgress);
        
        return ResponseEntity.ok(summary);
    }

    @GetMapping("/decks/{id}/cards")
    public ResponseEntity<List<Flashcard>> getCards(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        UUID userId = resolveUserId(jwt);
        return ResponseEntity.ok(studentFlashcardService.getCardsToStudy(id, userId));
    }

    @PostMapping("/cards/{id}/result")
    public ResponseEntity<Void> recordCardResult(@PathVariable UUID id, @RequestParam String rating, @AuthenticationPrincipal Jwt jwt) {
        UUID userId = resolveUserId(jwt);
        studentFlashcardService.recordResult(id, userId, rating);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/decks")
    public ResponseEntity<FlashcardDeck> createDeck(
            @RequestBody Map<String, String> body,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = resolveUserId(jwt);
        return ResponseEntity.ok(studentFlashcardService.createDeck(
            userId, 
            body.get("title"), 
            body.get("description"), 
            body.get("icon"), 
            body.get("color")
        ));
    }

    private UUID resolveUserId(Jwt jwt) {
        return userService.resolveUserId(jwt);
    }

    @PostMapping("/decks/{deckId}/cards")
    public ResponseEntity<Flashcard> createCard(
            @PathVariable UUID deckId,
            @RequestBody Map<String, String> body) {
        return ResponseEntity.ok(studentFlashcardService.createCard(
            deckId, 
            body.get("front"), 
            body.get("back")
        ));
    }
}
