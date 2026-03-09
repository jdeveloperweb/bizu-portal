package com.bizu.portal.content.domain;

import jakarta.persistence.*;
import lombok.*;

import java.time.OffsetDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "flashcard_decks", schema = "content")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FlashcardDeck {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(nullable = false)
    private String title;

    @Column(columnDefinition = "TEXT")
    private String description;

    private String icon; // Icon name for Lucide

    private String color; // Tailind gradient classes or hex

    @Column(name = "user_id")
    private UUID userId;

    @Column(name = "original_creator_id")
    private UUID originalCreatorId;

    @Column(name = "guild_id")
    private UUID guildId;

    @Column(name = "shared_with_guild_id")
    private UUID sharedWithGuildId;

    @Column(name = "source_deck_id")
    private UUID sourceDeckId;

    @Column(name = "course_id")
    private UUID courseId;

    @Column(name = "is_for_sale")
    private boolean isForSale;

    private Integer price;

    private Double rating;

    @Column(name = "rating_count")
    private Integer ratingCount;

    @Column(name = "created_at", nullable = false, updatable = false)
    private OffsetDateTime createdAt;

    @OneToMany(mappedBy = "deck", cascade = CascadeType.ALL, orphanRemoval = true)
    @Builder.Default
    @com.fasterxml.jackson.annotation.JsonManagedReference
    private List<Flashcard> cards = new ArrayList<>();

    @PrePersist
    protected void onCreate() {
        createdAt = OffsetDateTime.now();
    }
}
