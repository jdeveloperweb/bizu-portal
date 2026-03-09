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
    private final com.bizu.portal.admin.application.SystemSettingsService systemSettingsService;
    private final com.bizu.portal.commerce.application.EntitlementService entitlementService;

    @Transactional
    public GuildResponseDTO createGuild(UUID creatorId, GuildCreateRequestDTO request) {
        User creator = userService.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        GamificationStats stats = gamificationRepository.findById(creatorId)
                .orElseThrow(() -> new RuntimeException("Dados de gamificação não encontrados"));

        if (!guildMemberRepository.findAllByUserId(creatorId).isEmpty()) {
            throw new RuntimeException("Você já faz parte de uma guilda! Saia da atual para criar uma nova.");
        }

        int creationCost = systemSettingsService.getSettings().getGuildCreationCost();

        if (stats.getAxonCoins() == null || stats.getAxonCoins() < creationCost) {
            throw new RuntimeException("Saldo insuficiente! Criar uma guilda custa " + creationCost + " Axons.");
        }
        
        stats.setAxonCoins(stats.getAxonCoins() - creationCost);
        gamificationRepository.save(stats);

        Guild guild = Guild.builder()
                .name(request.getName())
                .description(request.getDescription())
                .badge(request.getBadge())
                .isPublic(request.isPublic())
                .maxMembers(request.getMaxMembers())
                .build();

        Guild savedGuild = guildRepository.save(guild);

        GuildMember founder = GuildMember.builder()
                .guild(savedGuild)
                .user(creator)
                .role(GuildRole.FOUNDER)
                .build();

        guildMemberRepository.save(founder);

        // Process invites if any
        if (request.getInvitedUserIds() != null && !request.getInvitedUserIds().isEmpty()) {
            UUID activeCourseId = com.bizu.portal.shared.security.CourseContextHolder.getCourseId();
            for (UUID inviteeId : request.getInvitedUserIds()) {
                // If course context is present, only invite if they have access to the same course
                if (activeCourseId != null && !entitlementService.hasAccess(inviteeId, activeCourseId)) {
                    continue; // Skip if not in the same course
                }

                userService.findById(inviteeId).ifPresent(invitee -> {
                    GuildInvite invite = GuildInvite.builder()
                            .guild(savedGuild)
                            .inviter(creator)
                            .invitee(invitee)
                            .status(GuildInvite.Status.PENDING)
                            .build();
                    guildInviteRepository.save(invite);
                });
            }
        }

        recordActivity(savedGuild, creator, "criou a guild", 0);

        return mapToResponseDTO(savedGuild, creatorId);
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

    // --- Invites ---

    @Transactional(readOnly = true)
    public List<GuildInviteDTO> getPendingInvites(UUID userId) {
        return guildInviteRepository.findAllByInviteeIdAndStatus(userId, GuildInvite.Status.PENDING).stream()
                .map(i -> GuildInviteDTO.builder()
                        .id(i.getId())
                        .guildId(i.getGuild().getId())
                        .guildName(i.getGuild().getName())
                        .badge(i.getGuild().getBadge())
                        .inviterName(i.getInviter().getName())
                        .createdAt(i.getCreatedAt().format(DateTimeFormatter.ofPattern("dd/MM/yyyy HH:mm")))
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public void acceptInvite(UUID inviteId, UUID userId) {
        GuildInvite invite = guildInviteRepository.findById(inviteId)
                .orElseThrow(() -> new RuntimeException("Convite não encontrado"));

        if (!invite.getInvitee().getId().equals(userId)) {
            throw new RuntimeException("Este convite não pertence a você");
        }

        invite.setStatus(GuildInvite.Status.ACCEPTED);
        guildInviteRepository.save(invite);

        // Enforce only one guild
        if (!guildMemberRepository.findAllByUserId(userId).isEmpty()) {
            throw new RuntimeException("Você já faz parte de uma guilda! Saia da atual para aceitar este convite.");
        }

        // Check if already a member (redundant now but safe)
        if (guildMemberRepository.findByGuildIdAndUserId(invite.getGuild().getId(), userId).isEmpty()) {
            GuildMember member = GuildMember.builder()
                    .guild(invite.getGuild())
                    .user(invite.getInvitee())
                    .role(GuildRole.MEMBER)
                    .build();
            guildMemberRepository.save(member);
            recordActivity(invite.getGuild(), invite.getInvitee(), "entrou na guilda pelo convite de " + invite.getInviter().getName(), 0);
        }
    }

    @Transactional
    public void declineInvite(UUID inviteId, UUID userId) {
        GuildInvite invite = guildInviteRepository.findById(inviteId)
                .orElseThrow(() -> new RuntimeException("Convite não encontrado"));

        if (!invite.getInvitee().getId().equals(userId)) {
            throw new RuntimeException("Este convite não pertence a você");
        }

        invite.setStatus(GuildInvite.Status.DECLINED);
        guildInviteRepository.save(invite);
    }

    @Transactional
    public void joinGuild(UUID guildId, UUID userId) {
        if (!guildMemberRepository.findAllByUserId(userId).isEmpty()) {
            throw new RuntimeException("Você já faz parte de uma guilda!");
        }

        Guild guild = guildRepository.findById(guildId)
                .orElseThrow(() -> new RuntimeException("Guild não encontrada"));

        if (!guild.isPublic()) {
            // Should probably create a request instead of joining directly, 
            // but for now I'll follow the "entrance" logic if it's public.
            // If it's private, we should use the Request system (if it exists).
            throw new RuntimeException("Esta guilda é privada. Peça acesso ou seja convidado.");
        }

        if (guildMemberRepository.findAllByGuildId(guildId).size() >= guild.getMaxMembers()) {
            throw new RuntimeException("Esta guilda está cheia!");
        }

        User user = userService.findById(userId)
                .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));

        GuildMember member = GuildMember.builder()
                .guild(guild)
                .user(user)
                .role(GuildRole.MEMBER)
                .build();

        guildMemberRepository.save(member);
        recordActivity(guild, user, "entrou na guilda", 0);
    }

    @Transactional
    public void leaveGuild(UUID guildId, UUID userId) {
        GuildMember member = guildMemberRepository.findByGuildIdAndUserId(guildId, userId)
                .orElseThrow(() -> new RuntimeException("Você não é membro desta guilda"));

        if (member.getRole() == GuildRole.FOUNDER) {
            // If founder leaves, maybe transfer ownership or delete guild?
            // For now, let's just block or handle it simply.
            long memberCount = guildMemberRepository.findAllByGuildId(guildId).size();
            if (memberCount > 1) {
                throw new RuntimeException("Como fundador, você deve transferir a liderança antes de sair ou deletar a guilda.");
            } else {
                // Delete guild if founder is the last one? 
                // Let's keep it simple: just delete the member and if no one left, the guild might stay empty or we delete it.
                // Usually founder shouldn't leave easily.
            }
        }

        guildMemberRepository.delete(member);
        
        Guild guild = guildRepository.findById(guildId).orElse(null);
        User user = userService.findById(userId).orElse(null);
        if (guild != null && user != null) {
            recordActivity(guild, user, "saiu da guilda", 0);
        }
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

    public List<GuildResponseDTO> getMyGuilds(UUID userId) {
        return guildMemberRepository.findAllByUserId(userId).stream()
                .map(m -> mapToResponseDTO(m.getGuild(), userId))
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
        boolean isMember = members.stream()
                .anyMatch(m -> m.getUser().getId().equals(userId));
        boolean isFounder = members.stream()
                .anyMatch(m -> m.getUser().getId().equals(userId) && m.getRole() == GuildRole.FOUNDER);
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
                .isMember(isMember)
                .isFounder(isFounder)
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
