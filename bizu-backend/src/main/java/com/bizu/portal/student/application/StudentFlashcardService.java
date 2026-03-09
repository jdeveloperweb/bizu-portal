package com.bizu.portal.student.application;

import com.bizu.portal.content.domain.Flashcard;
import com.bizu.portal.content.domain.FlashcardDeck;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.student.domain.FlashcardProgress;
import com.bizu.portal.content.infrastructure.FlashcardDeckRepository;
import com.bizu.portal.content.infrastructure.FlashcardRepository;
import com.bizu.portal.identity.infrastructure.UserRepository;
import com.bizu.portal.student.infrastructure.FlashcardProgressRepository;
import com.bizu.portal.student.guild.repository.GuildRepository;
import com.bizu.portal.student.guild.repository.GuildMemberRepository;
import com.bizu.portal.shared.security.CourseContextHolder;
import com.bizu.portal.student.guild.domain.GuildMember;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.ArrayList;
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
    private final GuildRepository guildRepository;
    private final GuildMemberRepository guildMemberRepository;
    private final com.bizu.portal.content.infrastructure.FlashcardDeckPurchaseRepository purchaseRepository;
    private final com.bizu.portal.content.infrastructure.FlashcardDeckRatingRepository ratingRepository;
    private final com.bizu.portal.student.infrastructure.GamificationRepository gamificationRepository;

    public List<StudentFlashcardDeckDTO> getDecksForUser(UUID userId) {
        OffsetDateTime now = OffsetDateTime.now();
        UUID activeCourseId = CourseContextHolder.getCourseId();
        
        // Buscar IDs das guildas que o usuário participa
        List<UUID> myGuildIds = guildMemberRepository.findAllByUserId(userId).stream()
            .map(m -> m.getGuild().getId())
            .collect(Collectors.toList());

        // Show global decks (userId is null), user's own decks, AND decks from user's guilds
        return deckRepository.findAll().stream()
            .filter(deck -> {
                // 1. Decks da guilda: só aparecem para membros daquela guilda
                if (deck.getGuildId() != null) {
                    // Evitar duplicidade: se o usuário for o criador original, ele já vê o deck dele na lista pessoal
                    if (userId.equals(deck.getOriginalCreatorId())) {
                        return false;
                    }
                    return myGuildIds.contains(deck.getGuildId());
                }
                
                // 2. Decks pessoais: aparecem apenas para o dono
                if (deck.getUserId() != null) {
                    return deck.getUserId().equals(userId);
                }
                
                // 3. Decks globais (userId e guildId nulos): 
                // Não devem aparecer na lista principal se forem para venda (aparecem na loja)
                if (deck.isForSale()) {
                    return false;
                }

                // Filtrar pelo curso se definido
                if (activeCourseId != null && deck.getCourseId() != null) {
                    return deck.getCourseId().equals(activeCourseId);
                }
                
                return true;
            })
            .map(deck -> {
                long total = deck.getCards().size();
                long due = progressRepository.countDueByDeckAndUser(deck.getId(), userId, now);
                long newCards = progressRepository.countNewByDeckAndUser(deck.getId(), userId);
                
                long studied = total - newCards;
                int progressPercent = total > 0 ? (int) ((studied * 100) / total) : 0;

                // Nome da Guilda (se for um deck de guilda ou compartilhado com uma)
                String guildName = null;
                UUID guildIdToShow = deck.getGuildId() != null ? deck.getGuildId() : deck.getSharedWithGuildId();
                if (guildIdToShow != null) {
                    guildName = guildRepository.findById(guildIdToShow)
                        .map(g -> g.getName())
                        .orElse(null);
                }

                // Informações de compartilhamento para o proprietário ver
                List<ShareInfoDTO> shares = new ArrayList<>();
                if (deck.getUserId() != null && deck.getUserId().equals(userId)) {
                    // Amigos que receberam cópias
                    deckRepository.findAllBySourceDeckId(deck.getId()).forEach(copy -> {
                        if (copy.getUserId() != null && !userId.equals(copy.getUserId())) {
                            userRepository.findById(copy.getUserId()).ifPresent(u -> {
                                shares.add(ShareInfoDTO.builder()
                                    .deckId(copy.getId())
                                    .name(u.getNickname() != null ? u.getNickname() : u.getName())
                                    .avatarUrl(u.getAvatarUrl())
                                    .type("USER")
                                    .build());
                            });
                        } else if (copy.getGuildId() != null) {
                            guildRepository.findById(copy.getGuildId()).ifPresent(g -> {
                                shares.add(ShareInfoDTO.builder()
                                    .deckId(copy.getId())
                                    .name(g.getName())
                                    .type("GUILD")
                                    .build());
                            });
                        }
                    });
                }

                String creatorName = deck.getOriginalCreatorId() != null ? 
                    userRepository.findById(deck.getOriginalCreatorId()).map(u -> u.getName()).orElse("Desconhecido") : null;

                boolean isPurchased = purchaseRepository.existsByDeckIdAndStudentId(deck.getId(), userId);

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
                    .sharedWithGuildName(guildName)
                    .userId(deck.getUserId())
                    .originalCreatorId(deck.getOriginalCreatorId())
                    .originalCreatorName(creatorName)
                    .isForSale(deck.isForSale())
                    .price(deck.getPrice())
                    .rating(deck.getRating())
                    .ratingCount(deck.getRatingCount())
                    .isPurchased(isPurchased)
                    .isOwner(deck.getUserId() != null && deck.getUserId().equals(userId))
                    .guildId(deck.getGuildId())
                    .sharedWith(shares)
                    .build();
            })
.collect(Collectors.toList());
    }

    @Transactional
    public FlashcardDeck createDeck(UUID userId, String title, String description, String icon, String color) {
        FlashcardDeck deck = FlashcardDeck.builder()
            .userId(userId)
            .originalCreatorId(userId)
            .courseId(CourseContextHolder.getCourseId())
            .title(title)
            .description(description)
            .icon(icon != null ? icon : "Layers")
            .color(color != null ? color : "from-indigo-500 to-violet-600")
            .isForSale(false)
            .price(0)
            .rating(0.0)
            .ratingCount(0)
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

    public List<Flashcard> getAllCards(UUID deckId) {
        return deckRepository.findById(deckId)
            .map(FlashcardDeck::getCards)
            .orElse(List.of());
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

    @Transactional
    public void shareDeck(UUID deckId, UUID userId, String targetType, UUID targetId) {
        FlashcardDeck sourceDeck = deckRepository.findById(deckId)
            .orElseThrow(() -> new RuntimeException("Deck not found"));
        
        // Verifica permissão (apenas dono real do deck pode compartilhar)
        if (sourceDeck.getUserId() == null || !sourceDeck.getUserId().equals(userId)) {
            throw new RuntimeException("Você não tem permissão para compartilhar este deck");
        }

        User owner = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        if ("FRIEND".equalsIgnoreCase(targetType) || "USER".equalsIgnoreCase(targetType)) {
            // Ao compartilhar com um amigo, criamos uma CÓPIA do deck para ele
            User friend = userRepository.findById(targetId)
                .orElseThrow(() -> new RuntimeException("Amigo não encontrado"));
            
            FlashcardDeck sharedDeck = FlashcardDeck.builder()
                .userId(friend.getId())
                .sourceDeckId(sourceDeck.getId())
                .originalCreatorId(userId)
                .courseId(sourceDeck.getCourseId())
                .title(sourceDeck.getTitle())
                .description(sourceDeck.getDescription())
                .icon(sourceDeck.getIcon())
                .color(sourceDeck.getColor())
                .build();
                
            FlashcardDeck savedSharedDeck = deckRepository.save(sharedDeck);
            
            List<Flashcard> copiedCards = sourceDeck.getCards().stream()
                .map(card -> Flashcard.builder()
                    .deck(savedSharedDeck)
                    .front(card.getFront())
                    .back(card.getBack())
                    .build()
                ).collect(Collectors.toList());
                
            flashcardRepository.saveAll(copiedCards);

        } else if ("GUILD".equalsIgnoreCase(targetType)) {
            // Ao compartilhar com uma guilda, usamos a mesma entidade FlashcardDeck mas com guildId
            if (!guildRepository.existsById(targetId)) {
                throw new RuntimeException("Guilda não encontrada");
            }

            var guild = guildRepository.findById(targetId).get();

            FlashcardDeck guildDeck = FlashcardDeck.builder()
                .guildId(targetId)
                .sourceDeckId(sourceDeck.getId())
                .originalCreatorId(userId)
                .courseId(guild.getCourseId())
                .title(sourceDeck.getTitle())
                .description(sourceDeck.getDescription())
                .icon(sourceDeck.getIcon())
                .color(sourceDeck.getColor())
                .build();

            FlashcardDeck savedGuildDeck = deckRepository.save(guildDeck);

            List<Flashcard> guildCards = sourceDeck.getCards().stream()
                .map(card -> Flashcard.builder()
                    .deck(savedGuildDeck)
                    .front(card.getFront())
                    .back(card.getBack())
                    .build()
                ).collect(Collectors.toList());

            flashcardRepository.saveAll(guildCards);

            // Marca o deck original como compartilhado com esta guild
            sourceDeck.setSharedWithGuildId(targetId);
            deckRepository.save(sourceDeck);
            
        } else {
            throw new RuntimeException("Tipo de destino inválido");
        }
    }

    @Transactional
    public FlashcardDeck cloneGuildDeck(UUID guildDeckId, UUID userId) {
        FlashcardDeck guildDeck = deckRepository.findById(guildDeckId)
            .orElseThrow(() -> new RuntimeException("Deck da guilda não encontrado"));

        FlashcardDeck personalDeck = FlashcardDeck.builder()
            .userId(userId)
            .originalCreatorId(guildDeck.getOriginalCreatorId())
            .courseId(CourseContextHolder.getCourseId())
            .title(guildDeck.getTitle() + " (Clonado)")
            .description(guildDeck.getDescription())
            .icon(guildDeck.getIcon())
            .color(guildDeck.getColor())
            .isForSale(false)
            .price(0)
            .rating(0.0)
            .ratingCount(0)
            .build();
            
        FlashcardDeck savedPersonalDeck = deckRepository.save(personalDeck);

        List<Flashcard> personalCards = guildDeck.getCards().stream()
            .map(gc -> Flashcard.builder()
                .deck(savedPersonalDeck)
                .front(gc.getFront())
                .back(gc.getBack())
                .build())
            .collect(Collectors.toList());

        flashcardRepository.saveAll(personalCards);
        return savedPersonalDeck;
    }

    @Transactional
    public void updateDeckStoreSettings(UUID deckId, UUID userId, boolean isForSale, Integer price) {
        FlashcardDeck deck = deckRepository.findById(deckId)
            .orElseThrow(() -> new RuntimeException("Deck não encontrado"));
            
        if (!deck.getUserId().equals(userId)) {
            throw new RuntimeException("Apenas o proprietário pode alterar as configurações da loja");
        }
        
        // Regra: se o deck foi comprado ou compartilhado (não é o criador original), não pode vender
        if (deck.getOriginalCreatorId() != null && !deck.getOriginalCreatorId().equals(userId)) {
            throw new RuntimeException("Você não pode vender um deck que foi comprado ou compartilhado com você");
        }
        
        deck.setForSale(isForSale);
        deck.setPrice(price != null ? price : 0);
        deckRepository.save(deck);
    }

    @Transactional
    public FlashcardDeck updateDeck(UUID deckId, UUID userId, String title, String description, String icon, String color) {
        FlashcardDeck deck = deckRepository.findById(deckId)
            .orElseThrow(() -> new RuntimeException("Deck não encontrado"));

        if (!deck.getUserId().equals(userId)) {
            throw new RuntimeException("Você não tem permissão para editar este deck");
        }

        deck.setTitle(title);
        deck.setDescription(description);
        deck.setIcon(icon);
        deck.setColor(color);

        return deckRepository.save(deck);
    }

    @Transactional
    public void deleteDeck(UUID deckId, UUID userId) {
        FlashcardDeck deck = deckRepository.findById(deckId)
            .orElseThrow(() -> new RuntimeException("Deck não encontrado"));

        if (deck.getUserId() == null || !deck.getUserId().equals(userId)) {
            throw new RuntimeException("Apenas o proprietário do deck pode excluí-lo");
        }

        // Se é uma cópia comprada, remover o registro de compra para permitir recompra
        if (deck.getSourceDeckId() != null) {
            purchaseRepository.deleteByDeckIdAndStudentId(deck.getSourceDeckId(), userId);
        }

        deckRepository.delete(deck);
    }

    @Transactional
    public void unshareDeck(UUID sharedDeckId, UUID requesterId) {
        FlashcardDeck sharedCopy = deckRepository.findById(sharedDeckId)
            .orElseThrow(() -> new RuntimeException("Cópia compartilhada não encontrada"));

        if (sharedCopy.getSourceDeckId() == null) {
            throw new RuntimeException("Este deck não é uma cópia compartilhada");
        }

        FlashcardDeck sourceDeck = deckRepository.findById(sharedCopy.getSourceDeckId())
            .orElseThrow(() -> new RuntimeException("Deck original não encontrado"));

        if (!sourceDeck.getUserId().equals(requesterId)) {
            throw new RuntimeException("Apenas o proprietário original pode remover o compartilhamento");
        }

        // Se for uma cópia de guilda, limpar a referência na fonte
        if (sharedCopy.getGuildId() != null) {
            if (sourceDeck.getSharedWithGuildId() != null && sourceDeck.getSharedWithGuildId().equals(sharedCopy.getGuildId())) {
                sourceDeck.setSharedWithGuildId(null);
                deckRepository.save(sourceDeck);
            }
        }

        deckRepository.delete(sharedCopy);
    }

    public List<StudentFlashcardDeckDTO> getStoreDecks(UUID userId) {
        UUID activeCourseId = CourseContextHolder.getCourseId();
        
        return deckRepository.findAllByIsForSaleTrue().stream()
            .filter(deck -> activeCourseId == null || deck.getCourseId() == null || deck.getCourseId().equals(activeCourseId))
            .map(deck -> {
                String creatorName = deck.getOriginalCreatorId() != null ? 
                    userRepository.findById(deck.getOriginalCreatorId()).map(u -> u.getName()).orElse("Desconhecido") : "Sistema";

                boolean isPurchased = purchaseRepository.existsByDeckIdAndStudentId(deck.getId(), userId);
                boolean isOwner = deck.getUserId() != null && deck.getUserId().equals(userId);

                return StudentFlashcardDeckDTO.builder()
                    .id(deck.getId())
                    .title(deck.getTitle())
                    .description(deck.getDescription())
                    .icon(deck.getIcon())
                    .color(deck.getColor())
                    .totalCards(deck.getCards().size())
                    .originalCreatorId(deck.getOriginalCreatorId())
                    .originalCreatorName(creatorName)
                    .price(deck.getPrice())
                    .rating(deck.getRating())
                    .ratingCount(deck.getRatingCount())
                    .isForSale(deck.isForSale())
                    .isPurchased(isPurchased)
                    .isOwner(isOwner)
                    .build();
            }).collect(Collectors.toList());
    }

    @Transactional
    public FlashcardDeck buyDeck(UUID deckId, UUID buyerId) {
        FlashcardDeck storeDeck = deckRepository.findById(deckId)
            .orElseThrow(() -> new RuntimeException("Deck não encontrado"));

        if (!storeDeck.isForSale()) {
            throw new RuntimeException("Este deck não está à venda");
        }

        if (purchaseRepository.existsByDeckIdAndStudentId(deckId, buyerId)) {
            throw new RuntimeException("Você já comprou este deck");
        }

        var stats = gamificationRepository.findById(buyerId)
            .orElseThrow(() -> new RuntimeException("Perfil de gamificação não encontrado"));

        if (stats.getAxonCoins() < storeDeck.getPrice()) {
            throw new RuntimeException("Axons insuficientes");
        }

        // Deduzir axons
        stats.setAxonCoins(stats.getAxonCoins() - storeDeck.getPrice());
        gamificationRepository.save(stats);

        // Registrar compra
        com.bizu.portal.content.domain.FlashcardDeckPurchase purchase = com.bizu.portal.content.domain.FlashcardDeckPurchase.builder()
            .deckId(deckId)
            .studentId(buyerId)
            .pricePaid(storeDeck.getPrice())
            .build();
        purchaseRepository.save(purchase);

        // Criar cópia para o usuário
        FlashcardDeck buyerDeck = FlashcardDeck.builder()
            .userId(buyerId)
            .sourceDeckId(deckId) // Link para o deck original da loja
            .originalCreatorId(storeDeck.getOriginalCreatorId())
            .courseId(CourseContextHolder.getCourseId())
            .title(storeDeck.getTitle())
            .description(storeDeck.getDescription())
            .icon(storeDeck.getIcon())
            .color(storeDeck.getColor())
            .isForSale(false)
            .price(0)
            .rating(0.0)
            .ratingCount(0)
            .build();
            
        FlashcardDeck savedBuyerDeck = deckRepository.save(buyerDeck);

        List<Flashcard> buyerCards = storeDeck.getCards().stream()
            .map(card -> Flashcard.builder()
                .deck(savedBuyerDeck)
                .front(card.getFront())
                .back(card.getBack())
                .build()
            ).collect(Collectors.toList());
            
        flashcardRepository.saveAll(buyerCards);

        return savedBuyerDeck;
    }

    @Transactional
    public void rateDeck(UUID deckId, UUID studentId, int rating, String comment) {
        // Encontrar o deck ORIGINAL (o que está à venda) se este for uma cópia
        FlashcardDeck deck = deckRepository.findById(deckId)
            .orElseThrow(() -> new RuntimeException("Deck não encontrado"));
            
        // Se o deck for pessoal e tiver originalCreatorId, avaliamos o original
        if (deck.getOriginalCreatorId() != null) {
            // Procurar deck original do mesmo criador com isForSale=true e título igual (aproximação simples)
            // Idealmente, teríamos um link direto flashcard_decks.source_deck_id
            // Mas vamos simplificar: avaliamos o deck que o usuário tem.
        }

        if (ratingRepository.existsByDeckIdAndStudentId(deckId, studentId)) {
            throw new RuntimeException("Você já avaliou este deck");
        }

        com.bizu.portal.content.domain.FlashcardDeckRating ratingEntry = com.bizu.portal.content.domain.FlashcardDeckRating.builder()
            .deckId(deckId)
            .studentId(studentId)
            .rating(rating)
            .comment(comment)
            .build();
        ratingRepository.save(ratingEntry);

        // Atualizar média do deck
        List<com.bizu.portal.content.domain.FlashcardDeckRating> allRatings = ratingRepository.findAllByDeckId(deckId);
        double avg = allRatings.stream().mapToInt(r -> r.getRating()).average().orElse(0.0);
        deck.setRating(avg);
        deck.setRatingCount(allRatings.size());
        deckRepository.save(deck);
    }
    
    @Transactional
    public void removeDeckFromGuild(UUID deckId, UUID requesterId) {
        FlashcardDeck deck = deckRepository.findById(deckId)
            .orElseThrow(() -> new RuntimeException("Deck não encontrado"));

        if (deck.getGuildId() == null) {
            throw new RuntimeException("Este deck não pertence a uma guilda");
        }

        UUID guildId = deck.getGuildId();
        
        // Verificar se o solicitante é ADMIN ou FOUNDER da guilda
        GuildMember member = guildMemberRepository.findByGuildIdAndUserId(guildId, requesterId)
            .orElseThrow(() -> new RuntimeException("Você não é membro desta guilda"));

        if (member.getRole() != GuildMember.GuildRole.ADMIN && member.getRole() != GuildMember.GuildRole.FOUNDER) {
            throw new RuntimeException("Apenas administradores da guilda podem remover decks");
        }

        // Se o deck tiver um sourceDeckId, limpar a referência no original
        if (deck.getSourceDeckId() != null) {
            deckRepository.findById(deck.getSourceDeckId()).ifPresent(sourceDeck -> {
                if (guildId.equals(sourceDeck.getSharedWithGuildId())) {
                    sourceDeck.setSharedWithGuildId(null);
                    deckRepository.save(sourceDeck);
                }
            });
        }

        deckRepository.delete(deck);
    }

    public java.util.Map<String, Object> getMySalesStats(UUID userId) {
        // Decks do criador que estão à venda
        List<FlashcardDeck> myForSaleDecks = deckRepository.findAllByIsForSaleTrue().stream()
            .filter(d -> userId.equals(d.getUserId()))
            .collect(Collectors.toList());

        List<UUID> myDeckIds = myForSaleDecks.stream().map(FlashcardDeck::getId).collect(Collectors.toList());
        List<com.bizu.portal.content.domain.FlashcardDeckPurchase> purchases = myDeckIds.isEmpty()
            ? java.util.Collections.emptyList()
            : purchaseRepository.findAllByDeckIdIn(myDeckIds);

        int totalSales = purchases.size();
        int totalAxonsEarned = purchases.stream().mapToInt(p -> p.getPricePaid()).sum();

        int currentAxons = gamificationRepository.findById(userId)
            .map(s -> s.getAxonCoins()).orElse(0);

        // Vendas por deck
        java.util.Map<UUID, Long> salesByDeck = purchases.stream()
            .collect(Collectors.groupingBy(com.bizu.portal.content.domain.FlashcardDeckPurchase::getDeckId, Collectors.counting()));
        java.util.Map<UUID, Integer> axonsByDeck = purchases.stream()
            .collect(Collectors.groupingBy(com.bizu.portal.content.domain.FlashcardDeckPurchase::getDeckId,
                Collectors.summingInt(com.bizu.portal.content.domain.FlashcardDeckPurchase::getPricePaid)));

        List<java.util.Map<String, Object>> deckStats = myForSaleDecks.stream().map(deck -> {
            java.util.Map<String, Object> entry = new java.util.HashMap<>();
            entry.put("deckId", deck.getId());
            entry.put("title", deck.getTitle());
            entry.put("price", deck.getPrice());
            entry.put("salesCount", salesByDeck.getOrDefault(deck.getId(), 0L));
            entry.put("axonsEarned", axonsByDeck.getOrDefault(deck.getId(), 0));
            return entry;
        }).collect(Collectors.toList());

        java.util.Map<String, Object> result = new java.util.HashMap<>();
        result.put("totalSales", totalSales);
        result.put("totalAxonsEarned", totalAxonsEarned);
        result.put("currentAxons", currentAxons);
        result.put("deckStats", deckStats);
        return result;
    }
}
