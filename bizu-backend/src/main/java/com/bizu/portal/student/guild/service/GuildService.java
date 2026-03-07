package com.bizu.portal.student.guild.service;

import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.student.application.LevelCalculator;
import com.bizu.portal.student.domain.GamificationStats;
import com.bizu.portal.student.guild.api.dto.*;
import com.bizu.portal.student.guild.domain.*;
import com.bizu.portal.student.guild.domain.GuildMember.GuildRole;
import com.bizu.portal.student.guild.repository.*;
import com.bizu.portal.student.domain.Note;
import com.bizu.portal.student.domain.StudentTask;
import com.bizu.portal.content.domain.FlashcardDeck;
import com.bizu.portal.content.infrastructure.FlashcardDeckRepository;
import com.bizu.portal.student.infrastructure.NoteRepository;
import com.bizu.portal.student.infrastructure.StudentTaskRepository;
import com.bizu.portal.student.infrastructure.GamificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class GuildService {

    private final GuildRepository guildRepository;
    private final GuildMemberRepository guildMemberRepository;
    private final GuildInviteRepository guildInviteRepository;
    private final GuildRequestRepository guildRequestRepository;
    private final GuildMaterialRepository guildMaterialRepository;
    private final GuildMissionRepository guildMissionRepository;
    private final GuildActivityRepository guildActivityRepository;
    private final GuildMessageRepository guildMessageRepository;
    private final NoteRepository noteRepository;
    private final StudentTaskRepository studentTaskRepository;
    private final FlashcardDeckRepository flashcardDeckRepository;
    private final GamificationRepository gamificationRepository;
    private final LevelCalculator levelCalculator;
    private final UserService userService;

    private static final int GUILD_CREATION_COST = 5000;

    @Transactional
    public GuildResponseDTO createGuild(UUID creatorId, GuildCreateRequestDTO request) {
        User creator = userService.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        GamificationStats stats = gamificationRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Dados de gamificação não encontrados"));

        if (stats.getAxonCoins() == null || stats.getAxonCoins() < GUILD_CREATION_COST) {
            throw new RuntimeException("Saldo insuficiente! Criar uma guilda custa " + GUILD_CREATION_COST + " Axons.");
        }

        stats.setAxonCoins(stats.getAxonCoins() - GUILD_CREATION_COST);
        gamificationRepository.save(stats);

        Guild guild = Guild.builder()
                .name(request.getName())
                .description(request.getDescription())
                .badge(request.getBadge())
                .isPublic(request.isPublic())
                .maxMembers(request.getMaxMembers())
                .build();

        guild = guildRepository.save(guild);

        GuildMember founder = GuildMember.builder()
                .guild(guild)
                .user(creator)
                .role(GuildRole.FOUNDER)
                .build();

        guildMemberRepository.save(founder);
        recordActivity(guild, creator, "criou a guild", 0);

        return mapToResponseDTO(guild, creatorId);
    }

    // --- Resources ---

    @Transactional
    public List<GuildNoteDTO> getNotes(UUID guildId, UUID userId) {
        validateMembership(guildId, userId);
        return noteRepository.findAllByGuildIdOrderByUpdatedAtDesc(guildId).stream()
                .map(n -> GuildNoteDTO.builder()
                        .id(n.getId())
                        .title(n.getTitle())
                        .content(n.getContent())
                        .author(n.getUser() != null ? n.getUser().getName() : "Sistema")
                        .updatedAt(n.getUpdatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public List<GuildTaskDTO> getTasks(UUID guildId, UUID userId) {
        validateMembership(guildId, userId);
        return studentTaskRepository.findAllByGuildIdOrderByCreatedAtDesc(guildId).stream()
                .map(t -> GuildTaskDTO.builder()
                        .id(t.getId())
                        .title(t.getTitle())
                        .description(t.getDescription())
                        .priority(t.getPriority())
                        .status(t.getStatus())
                        .assignee(t.getStudent() != null ? t.getStudent().getName() : "Não atribuído")
                        .dueDate(t.getDueDate())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public List<GuildFlashcardDeckDTO> getFlashcardDecks(UUID guildId, UUID userId) {
        validateMembership(guildId, userId);
        return flashcardDeckRepository.findAllByGuildIdOrderByCreatedAtDesc(guildId).stream()
                .map(d -> GuildFlashcardDeckDTO.builder()
                        .id(d.getId())
                        .title(d.getTitle())
                        .description(d.getDescription())
                        .icon(d.getIcon())
                        .color(d.getColor())
                        .cardCount(d.getCards().size())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public List<GuildFlashcardDTO> getFlashcardCards(UUID guildId, UUID deckId, UUID userId) {
        validateMembership(guildId, userId);
        FlashcardDeck deck = flashcardDeckRepository.findById(deckId)
                .orElseThrow(() -> new RuntimeException("Deck não encontrado"));
        
        return deck.getCards().stream()
                .map(f -> GuildFlashcardDTO.builder()
                        .id(f.getId())
                        .front(f.getFront())
                        .back(f.getBack())
                        .build())
                .collect(Collectors.toList());
    }

    // --- Chat ---

    @Transactional
    public GuildMessageDTO sendMessage(UUID guildId, UUID userId, String content) {
        Guild guild = guildRepository.findById(guildId)
                .orElseThrow(() -> new RuntimeException("Guild não encontrada"));
        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        validateMembership(guildId, userId);

        GuildMessage message = GuildMessage.builder()
                .guild(guild)
                .user(user)
                .content(content)
                .build();

        message = guildMessageRepository.save(message);

        return GuildMessageDTO.builder()
                .id(message.getId())
                .user(user.getName())
                .text(message.getContent())
                .time(message.getCreatedAt().format(DateTimeFormatter.ofPattern("HH:mm")))
                .isMe(true)
                .build();
    }

    public List<GuildMessageDTO> getChatMessages(UUID guildId, UUID userId) {
        return guildMessageRepository.findAllByGuildIdOrderByCreatedAtDesc(guildId, PageRequest.of(0, 50)).stream()
                .map(m -> GuildMessageDTO.builder()
                        .id(m.getId())
                        .user(m.getUser().getName())
                        .text(m.getContent())
                        .time(m.getCreatedAt().format(DateTimeFormatter.ofPattern("HH:mm")))
                        .isMe(m.getUser().getId().equals(userId))
                        .build())
                .sorted((a, b) -> a.getTime().compareTo(b.getTime()))
                .collect(Collectors.toList());
    }

    // --- Helpers ---

    private void validateMembership(UUID guildId, UUID userId) {
        guildMemberRepository.findByGuildIdAndUserId(guildId, userId)
                .orElseThrow(() -> new RuntimeException("Acesso negado: Você não é membro desta guild"));
    }

    public List<GuildResponseDTO> searchGuilds(UUID userId, String query) {
        return guildRepository.findAll().stream()
                .filter(g -> query == null || g.getName().toLowerCase().contains(query.toLowerCase()))
                .map(g -> mapToResponseDTO(g, userId))
                .collect(Collectors.toList());
    }

    public GuildResponseDTO getGuildDetails(UUID guildId, UUID userId) {
        Guild guild = guildRepository.findById(guildId)
                .orElseThrow(() -> new RuntimeException("Guild not found"));
        return mapToResponseDTO(guild, userId);
    }

    public GuildMemberResponseDTO getGuildMembers(UUID guildId, UUID userId) {
        List<GuildMember> members = guildMemberRepository.findAllByGuildId(guildId);
        
        List<GuildMemberDTO> memberDTOs = members.stream()
                .map(m -> {
                    GamificationStats stats = gamificationRepository.findById(m.getUser().getId()).orElse(null);
                    int xp = stats != null ? stats.getTotalXp() : 0;
                    return GuildMemberDTO.builder()
                            .id(m.getId())
                            .name(m.getUser().getName())
                            .nickname(m.getUser().getNickname())
                            .level(levelCalculator.calculateLevel(xp))
                            .xp(m.getXpContribution())
                            .role(m.getRole().name().toLowerCase())
                            .streak(m.getStreak())
                            .joinDate(m.getJoinedAt().format(DateTimeFormatter.ofPattern("MMM yyyy")))
                            .avatar(m.getUser().getAvatarUrl())
                            .online(m.getUser().getLastSeenAt() != null && 
                                    m.getUser().getLastSeenAt().isAfter(java.time.OffsetDateTime.now().minusMinutes(5)))
                            .build();
                })
                .sorted((a, b) -> Long.compare(b.getXp(), a.getXp()))
                .collect(Collectors.toList());

        List<GuildRequestDTO> pendingRequests = new ArrayList<>();
        GuildMember currentUser = guildMemberRepository.findByGuildIdAndUserId(guildId, userId).orElse(null);
        
        if (currentUser != null && (currentUser.getRole() == GuildRole.FOUNDER || currentUser.getRole() == GuildRole.ADMIN)) {
            pendingRequests = guildRequestRepository.findAllByGuildIdAndStatus(guildId, GuildRequest.Status.PENDING).stream()
                    .map(r -> {
                        GamificationStats stats = gamificationRepository.findById(r.getUser().getId()).orElse(null);
                        int xp = stats != null ? stats.getTotalXp() : 0;
                        return GuildRequestDTO.builder()
                                .id(r.getId())
                                .name(r.getUser().getName())
                                .nickname(r.getUser().getNickname())
                                .level(levelCalculator.calculateLevel(xp))
                                .message(r.getMessage())
                                .build();
                    })
                    .collect(Collectors.toList());
        }

        return GuildMemberResponseDTO.builder()
                .members(memberDTOs)
                .pendingRequests(pendingRequests)
                .build();
    }

    public List<GuildMaterialDTO> getGuildMaterials(UUID guildId) {
        return guildMaterialRepository.findAllByGuildIdOrderByCreatedAtDesc(guildId).stream()
                .map(m -> GuildMaterialDTO.builder()
                        .id(m.getId())
                        .title(m.getTitle())
                        .type(m.getType().toLowerCase())
                        .uploader(m.getUploader() != null ? m.getUploader().getNickname() : "Sistema")
                        .size(m.getFileSize())
                        .date(formatTimeAgo(m.getCreatedAt()))
                        .url(m.getUrl())
                        .build())
                .collect(Collectors.toList());
    }

    public List<GuildMissionDTO> getGuildMissions(UUID guildId) {
        return guildMissionRepository.findAllByGuildId(guildId).stream()
                .map(m -> GuildMissionDTO.builder()
                        .id(m.getId())
                        .title(m.getTitle())
                        .type(m.getType().toLowerCase())
                        .description(m.getDescription())
                        .progress(m.getProgress())
                        .total(m.getTarget())
                        .xpReward(m.getXpReward())
                        .endsAt(m.getEndsAt() != null ? formatEndsAt(m.getEndsAt()) : null)
                        .completed(m.isCompleted())
                        .build())
                .collect(Collectors.toList());
    }

    public List<GuildActivityDTO> getGuildActivity(UUID guildId) {
        return guildActivityRepository.findAllByGuildIdOrderByCreatedAtDesc(guildId, PageRequest.of(0, 10)).stream()
                .map(a -> GuildActivityDTO.builder()
                        .id(a.getId())
                        .user(a.getUser() != null ? a.getUser().getName() : "Sistema")
                        .action(a.getAction())
                        .xp(a.getXpGained())
                        .time(formatTimeAgo(a.getCreatedAt()))
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void recordActivity(Guild guild, User user, String action, int xp) {
        GuildActivity activity = GuildActivity.builder()
                .guild(guild)
                .user(user)
                .action(action)
                .xpGained(xp)
                .build();
        guildActivityRepository.save(activity);
    }

    private GuildResponseDTO mapToResponseDTO(Guild guild, UUID userId) {
        List<GuildMember> members = guildMemberRepository.findAllByGuildId(guild.getId());
        boolean isAdmin = members.stream()
                .anyMatch(m -> m.getUser().getId().equals(userId) && 
                         (m.getRole() == GuildRole.FOUNDER || m.getRole() == GuildRole.ADMIN));

        return GuildResponseDTO.builder()
                .id(guild.getId())
                .name(guild.getName())
                .description(guild.getDescription())
                .badge(guild.getBadge())
                .memberCount(members.size())
                .maxMembers(guild.getMaxMembers())
                .totalXp(guild.getTotalXp())
                .weeklyXp(guild.getWeeklyXp())
                .rankPosition(1) // Mock ranking
                .league(guild.getLeague())
                .streak(guild.getStreak())
                .isPublic(guild.isPublic())
                .isAdmin(isAdmin)
                .tags(new ArrayList<>())
                .createdAt(guild.getCreatedAt().format(DateTimeFormatter.ofPattern("MMMM yyyy")))
                .weeklyGoal(guild.getWeeklyGoal())
                .weeklyProgress(guild.getWeeklyGoal() > 0 ? (double) guild.getWeeklyXp() / guild.getWeeklyGoal() : 0)
                .build();
    }

    private String formatTimeAgo(java.time.OffsetDateTime dateTime) {
        java.time.Duration duration = java.time.Duration.between(dateTime, java.time.OffsetDateTime.now());
        if (duration.toMinutes() < 1) return "agora mesmo";
        if (duration.toMinutes() < 60) return duration.toMinutes() + " min atrás";
        if (duration.toHours() < 24) return duration.toHours() + "h atrás";
        return duration.toDays() + " dias atrás";
    }

    private String formatEndsAt(java.time.OffsetDateTime dateTime) {
        java.time.Duration duration = java.time.Duration.between(java.time.OffsetDateTime.now(), dateTime);
        if (duration.toHours() < 24) return duration.toHours() + "h";
        return duration.toDays() + " dias";
    }
}
