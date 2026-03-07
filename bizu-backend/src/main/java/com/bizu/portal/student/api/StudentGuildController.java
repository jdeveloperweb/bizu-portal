package com.bizu.portal.student.api;

import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.student.guild.api.dto.*;
import com.bizu.portal.student.guild.service.GuildService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/student/guilds")
@RequiredArgsConstructor
public class StudentGuildController {

    private final GuildService guildService;
    private final UserService userService;

    @GetMapping
    public ResponseEntity<List<GuildResponseDTO>> getAllGuilds(
            @AuthenticationPrincipal Jwt jwt,
            @RequestParam(required = false) String search) {
        UUID userId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(guildService.searchGuilds(userId, search));
    }

    @GetMapping("/{id}")
    public ResponseEntity<GuildResponseDTO> getGuildDetails(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(guildService.getGuildDetails(id, userId));
    }

    @PostMapping
    public ResponseEntity<GuildResponseDTO> createGuild(
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody GuildCreateRequestDTO request) {
        UUID userId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(guildService.createGuild(userId, request));
    }

    @GetMapping("/{id}/members")
    public ResponseEntity<GuildMemberResponseDTO> getGuildMembers(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(guildService.getGuildMembers(id, userId));
    }

    @GetMapping("/{id}/materials")
    public ResponseEntity<List<GuildMaterialDTO>> getGuildMaterials(@PathVariable UUID id) {
        return ResponseEntity.ok(guildService.getGuildMaterials(id));
    }

    @GetMapping("/{id}/missions")
    public ResponseEntity<List<GuildMissionDTO>> getGuildMissions(@PathVariable UUID id) {
        return ResponseEntity.ok(guildService.getGuildMissions(id));
    }

    @GetMapping("/{id}/activity")
    public ResponseEntity<List<GuildActivityDTO>> getGuildActivity(@PathVariable UUID id) {
        return ResponseEntity.ok(guildService.getGuildActivity(id));
    }

    @GetMapping("/{id}/notes")
    public ResponseEntity<List<GuildNoteDTO>> getGuildNotes(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(guildService.getNotes(id, userId));
    }

    @GetMapping("/{id}/tasks")
    public ResponseEntity<List<GuildTaskDTO>> getGuildTasks(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(guildService.getTasks(id, userId));
    }

    @GetMapping("/{id}/flashcards")
    public ResponseEntity<List<GuildFlashcardDeckDTO>> getGuildFlashcards(@PathVariable UUID id, @AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(guildService.getFlashcardDecks(id, userId));
    }

    @GetMapping("/{id}/flashcards/{deckId}/cards")
    public ResponseEntity<List<GuildFlashcardDTO>> getGuildFlashcardCards(
            @PathVariable UUID id,
            @PathVariable UUID deckId,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(guildService.getFlashcardCards(id, deckId, userId));
    }

    @GetMapping("/{id}/chat")
    public ResponseEntity<List<GuildMessageDTO>> getChatMessages(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(guildService.getChatMessages(id, userId));
    }

    @PostMapping("/{id}/chat")
    public ResponseEntity<GuildMessageDTO> sendMessage(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody GuildChatMessageRequestDTO request) {
        UUID userId = userService.resolveUserId(jwt);
        return ResponseEntity.ok(guildService.sendMessage(id, userId, request.getText()));
    }
}
