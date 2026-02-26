package com.bizu.portal.student.application;

import com.bizu.portal.content.domain.Flashcard;
import com.bizu.portal.content.domain.FlashcardDeck;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.student.domain.FlashcardProgress;
import com.bizu.portal.content.infrastructure.FlashcardDeckRepository;
import com.bizu.portal.content.infrastructure.FlashcardRepository;
import com.bizu.portal.identity.infrastructure.UserRepository;
import com.bizu.portal.student.infrastructure.FlashcardProgressRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class StudentFlashcardService {

    private final FlashcardDeckRepository deckRepository;
    private final FlashcardRepository flashcardRepository;
    private final FlashcardProgressRepository progressRepository;
    private final UserRepository userRepository;

    public List<StudentFlashcardDeckDTO> getDecksForUser(UUID userId) {
        OffsetDateTime now = OffsetDateTime.now();
        
        // Show global decks (userId is null) and user's own decks
        return deckRepository.findAll().stream()
            .filter(deck -> deck.getUserId() == null || deck.getUserId().equals(userId))
            .map(deck -> {
                long total = deck.getCards().size();
                long due = progressRepository.countDueByDeckAndUser(deck.getId(), userId, now);
                long newCards = progressRepository.countNewByDeckAndUser(deck.getId(), userId);
                
                // Progress is calculated as (studied cards / total cards) * 100
                // Studied cards are those that have a progress entry
                long studied = total - newCards;
                int progressPercent = total > 0 ? (int) ((studied * 100) / total) : 0;

                return StudentFlashcardDeckDTO.builder()
                    .id(deck.getId())
                    .title(deck.getTitle())
                    .description(deck.getDescription())
                    .icon(deck.getIcon())
                    .color(deck.getColor())
                    .totalCards(total)
                    .dueCards(due)
                    .newCards(newCards)
                    .progress(progressPercent)
                    .lastStudied("Há pouco")
                    .build();
            }).collect(Collectors.toList());
    }

    @Transactional
    public FlashcardDeck createDeck(UUID userId, String title, String description, String icon, String color) {
        FlashcardDeck deck = FlashcardDeck.builder()
            .userId(userId)
            .title(title)
            .description(description)
            .icon(icon != null ? icon : "Layers")
            .color(color != null ? color : "from-indigo-500 to-violet-600")
            .build();
        return deckRepository.save(deck);
    }

    @Transactional
    public Flashcard createCard(UUID deckId, String front, String back) {
        FlashcardDeck deck = deckRepository.findById(deckId)
            .orElseThrow(() -> new RuntimeException("Deck not found"));
            
        Flashcard card = Flashcard.builder()
            .deck(deck)
            .front(front)
            .back(back)
            .build();
            
        return flashcardRepository.save(card);
    }

    public List<Flashcard> getCardsToStudy(UUID deckId, UUID userId) {
        OffsetDateTime now = OffsetDateTime.now();
        
        // Get due cards
        // In a real app, you might want to limit the number or mix new/due
        return deckRepository.findById(deckId).map(deck -> {
            return deck.getCards().stream()
                .filter(f -> {
                    var progress = progressRepository.findByUserIdAndFlashcardId(userId, f.getId());
                    return progress.isEmpty() || progress.get().getNextReviewAt().isBefore(now);
                })
                .collect(Collectors.toList());
        }).orElse(List.of());
    }

    @Transactional
    public void recordResult(UUID flashcardId, UUID userId, String rating) {
        var progress = progressRepository.findByUserIdAndFlashcardId(userId, flashcardId)
            .orElseGet(() -> {
                Flashcard flashcard = flashcardRepository.findById(flashcardId)
                    .orElseThrow(() -> new RuntimeException("Flashcard not found"));
                
                User user = userRepository.findById(userId)
                    .orElseThrow(() -> new RuntimeException("User not found"));
                
                return FlashcardProgress.builder()
                    .user(user)
                    .flashcard(flashcard)
                    .intervalDays(0)
                    .easeFactor(new BigDecimal("2.5"))
                    .repetitions(0)
                    .build();
            });

        int quality = switch (rating) {
            case "hard" -> 1;
            case "medium" -> 3;
            case "easy" -> 5;
            default -> 3;
        };

        // Simplified SM-2 logic
        if (quality < 3) {
            progress.setRepetitions(0);
            progress.setIntervalDays(1);
        } else {
            if (progress.getRepetitions() == 0) {
                progress.setIntervalDays(1);
            } else if (progress.getRepetitions() == 1) {
                progress.setIntervalDays(3);
            } else {
                progress.setIntervalDays((int) Math.round(progress.getIntervalDays() * progress.getEaseFactor().doubleValue()));
            }
            progress.setRepetitions(progress.getRepetitions() + 1);
        }

        // Update ease factor: EF = EF + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
        double newEase = progress.getEaseFactor().doubleValue() + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02));
        progress.setEaseFactor(BigDecimal.valueOf(Math.max(1.3, newEase)));
        
        progress.setLastReviewedAt(OffsetDateTime.now());
        progress.setNextReviewAt(OffsetDateTime.now().plusDays(progress.getIntervalDays()));
        
        progressRepository.save(progress);
    }
}
