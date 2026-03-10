package com.bizu.portal.student.api.war;

import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.student.application.war.WarDayEventService;
import com.bizu.portal.student.application.war.WarDayGameService;
import com.bizu.portal.student.domain.war.WarDayEvent;
import com.bizu.portal.student.guild.repository.GuildMemberRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/war-day")
@RequiredArgsConstructor
public class StudentWarDayController {

    private final WarDayEventService eventService;
    private final WarDayGameService gameService;
    private final UserService userService;
    private final GuildMemberRepository guildMemberRepository;

    // ─── Event Discovery ──────────────────────────────────────────────────────

    @GetMapping("/active")
    public ResponseEntity<WarDayDTO.EventResponse> getActiveEvent(
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        UUID guildId = resolveGuildId(userId);

        return eventService.findActiveEvent()
                .map(e -> ResponseEntity.ok(eventService.getEventResponse(e, guildId)))
                .orElse(ResponseEntity.noContent().build());
    }

    @GetMapping("/upcoming")
    public ResponseEntity<List<WarDayDTO.EventResponse>> getUpcoming() {
        return ResponseEntity.ok(eventService.listUpcomingAndActive());
    }

    @GetMapping("/{id}")
    public ResponseEntity<WarDayDTO.EventResponse> getEvent(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        UUID guildId = resolveGuildId(userId);

        WarDayEvent event = eventService.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento não encontrado"));
        return ResponseEntity.ok(eventService.getEventResponse(event, guildId));
    }

    // ─── Join & Map ───────────────────────────────────────────────────────────

    @PostMapping("/{id}/join")
    public ResponseEntity<WarDayDTO.GuildMapState> joinEvent(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        UUID guildId = resolveGuildIdOrThrow(userId);
        return ResponseEntity.ok(gameService.joinEvent(id, guildId));
    }

    @GetMapping("/{id}/map")
    public ResponseEntity<WarDayDTO.GuildMapState> getMap(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        UUID guildId = resolveGuildIdOrThrow(userId);
        return ResponseEntity.ok(gameService.getMapState(id, guildId));
    }

    // ─── Zone Battle ──────────────────────────────────────────────────────────

    @GetMapping("/{id}/zone/{zoneId}/question")
    public ResponseEntity<WarDayDTO.QuestionResponse> getQuestion(
            @PathVariable UUID id,
            @PathVariable UUID zoneId,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        UUID guildId = resolveGuildIdOrThrow(userId);
        return ResponseEntity.ok(gameService.getQuestion(id, zoneId, guildId));
    }

    @PostMapping("/{id}/zone/{zoneId}/answer")
    public ResponseEntity<WarDayDTO.AnswerResult> submitAnswer(
            @PathVariable UUID id,
            @PathVariable UUID zoneId,
            @AuthenticationPrincipal Jwt jwt,
            @RequestBody WarDayDTO.AnswerRequest req) {
        UUID userId = userService.resolveUserId(jwt);
        UUID guildId = resolveGuildIdOrThrow(userId);
        return ResponseEntity.ok(gameService.submitAnswer(id, zoneId, guildId, userId, req));
    }

    // ─── Ranking ──────────────────────────────────────────────────────────────

    @GetMapping("/{id}/ranking")
    public ResponseEntity<WarDayDTO.RankingResponse> getRanking(
            @PathVariable UUID id,
            @AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        UUID guildId = resolveGuildId(userId);
        return ResponseEntity.ok(gameService.getLiveRanking(id, guildId));
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private UUID resolveGuildId(UUID userId) {
        return guildMemberRepository.findAllByUserId(userId).stream()
                .findFirst()
                .map(m -> m.getGuild().getId())
                .orElse(null);
    }

    private UUID resolveGuildIdOrThrow(UUID userId) {
        return guildMemberRepository.findAllByUserId(userId).stream()
                .findFirst()
                .map(m -> m.getGuild().getId())
                .orElseThrow(() -> new RuntimeException("Você precisa fazer parte de uma guild para participar do War Day"));
    }
}
