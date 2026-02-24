package com.bizu.portal.student.api;

import com.bizu.portal.student.application.StudentFlashcardDeckDTO;
import com.bizu.portal.student.application.StudentFlashcardService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
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

    @GetMapping("/decks")
    public ResponseEntity<List<StudentFlashcardDeckDTO>> getDecks(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(studentFlashcardService.getDecksForUser(userId));
    }

    @GetMapping("/summary")
    public ResponseEntity<Map<String, Object>> getSummary(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
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
    public ResponseEntity<List<com.bizu.portal.content.domain.Flashcard>> getCards(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(studentFlashcardService.getCardsToStudy(id, userId));
    }

    @PostMapping("/cards/{id}/result")
    public ResponseEntity<Void> recordCardResult(@PathVariable UUID id, @RequestParam String rating, @AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        studentFlashcardService.recordResult(id, userId, rating);
        return ResponseEntity.ok().build();
    }
}
