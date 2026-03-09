package com.bizu.portal.content.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.UUID;

@Entity
@Table(name = "flashcard_deck_purchases", schema = "content")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashcardDeckPurchase {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "deck_id", nullable = false)
    private UUID deckId;

    @Column(name = "student_id", nullable = false)
    private UUID studentId;

    @Column(name = "price_paid", nullable = false)
    private int pricePaid;

    @Column(name = "purchased_at", nullable = false, updatable = false)
    private OffsetDateTime purchasedAt;

    @PrePersist
    protected void onCreate() {
        purchasedAt = OffsetDateTime.now();
    }
}
