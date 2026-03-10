package com.bizu.portal.student.api.war;

import com.bizu.portal.student.application.war.WarDayEventService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/admin/war-day")
@RequiredArgsConstructor
public class AdminWarDayController {

    private final WarDayEventService eventService;

    // ─── Events ───────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<WarDayDTO.EventResponse>> listEvents() {
        return ResponseEntity.ok(eventService.listAllEvents());
    }

    @PostMapping
    public ResponseEntity<WarDayDTO.EventResponse> createEvent(
            @RequestBody WarDayDTO.EventCreateRequest req) {
        return ResponseEntity.ok(eventService.createEvent(req));
    }

    @PutMapping("/{id}")
    public ResponseEntity<WarDayDTO.EventResponse> updateEvent(
            @PathVariable UUID id,
            @RequestBody WarDayDTO.EventCreateRequest req) {
        return ResponseEntity.ok(eventService.updateEvent(id, req));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteEvent(@PathVariable UUID id) {
        eventService.deleteEvent(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{id}/start")
    public ResponseEntity<WarDayDTO.EventResponse> forceStart(@PathVariable UUID id) {
        return ResponseEntity.ok(eventService.forceStart(id));
    }

    @PostMapping("/{id}/end")
    public ResponseEntity<WarDayDTO.EventResponse> forceEnd(@PathVariable UUID id) {
        return ResponseEntity.ok(eventService.forceEnd(id));
    }

    @GetMapping("/{id}/rankings")
    public ResponseEntity<List<WarDayDTO.GuildRankingEntry>> getEventRankings(@PathVariable UUID id) {
        return ResponseEntity.ok(eventService.getAdminRankings(id));
    }

    // ─── Map Templates ────────────────────────────────────────────────────────

    @GetMapping("/map-templates")
    public ResponseEntity<List<WarDayDTO.MapTemplateResponse>> listMapTemplates() {
        return ResponseEntity.ok(eventService.listMapTemplates());
    }

    @PostMapping("/map-templates")
    public ResponseEntity<WarDayDTO.MapTemplateResponse> createMapTemplate(
            @RequestBody WarDayDTO.MapTemplateCreateRequest req) {
        return ResponseEntity.ok(eventService.createMapTemplate(req));
    }

    @PutMapping("/map-templates/{id}")
    public ResponseEntity<WarDayDTO.MapTemplateResponse> updateMapTemplate(
            @PathVariable UUID id,
            @RequestBody WarDayDTO.MapTemplateCreateRequest req) {
        return ResponseEntity.ok(eventService.updateMapTemplate(id, req));
    }
}
