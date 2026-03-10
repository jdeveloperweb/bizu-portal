package com.bizu.portal.student.application.war;

import com.bizu.portal.student.api.war.WarDayDTO;
import com.bizu.portal.student.domain.war.*;
import com.bizu.portal.student.infrastructure.war.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WarDayEventService {

    private final WarDayEventRepository eventRepository;
    private final WarMapTemplateRepository mapTemplateRepository;
    private final WarZoneTemplateRepository zoneTemplateRepository;
    private final GuildWarSessionRepository sessionRepository;
    private final WarZoneProgressRepository progressRepository;
    private final WarDayRankingRepository rankingRepository;

    // ─── Admin: CRUD ──────────────────────────────────────────────────────────

    @Transactional
    public WarDayDTO.EventResponse createEvent(WarDayDTO.EventCreateRequest req) {
        WarDayEvent event = WarDayEvent.builder()
                .title(req.getTitle())
                .description(req.getDescription())
                .startAt(OffsetDateTime.parse(req.getStartAt()))
                .endAt(OffsetDateTime.parse(req.getEndAt()))
                .xpRewardPerCorrect(req.getXpRewardPerCorrect() > 0 ? req.getXpRewardPerCorrect() : 10)
                .courseId(req.getCourseId())
                .minGuildSize(req.getMinGuildSize() > 0 ? req.getMinGuildSize() : 1)
                .status("UPCOMING")
                .build();

        if (req.getMapTemplateId() != null) {
            WarMapTemplate template = mapTemplateRepository.findById(req.getMapTemplateId())
                    .orElseThrow(() -> new RuntimeException("Template de mapa não encontrado"));
            event.setMapTemplate(template);
        }

        return mapToEventResponse(eventRepository.save(event), null, null, null, false);
    }

    @Transactional
    public WarDayDTO.EventResponse updateEvent(UUID id, WarDayDTO.EventCreateRequest req) {
        WarDayEvent event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento não encontrado"));

        if ("FINISHED".equals(event.getStatus()) || "ACTIVE".equals(event.getStatus())) {
            throw new RuntimeException("Não é possível editar um evento ativo ou finalizado");
        }

        event.setTitle(req.getTitle());
        if (req.getDescription() != null) event.setDescription(req.getDescription());
        if (req.getStartAt() != null) event.setStartAt(OffsetDateTime.parse(req.getStartAt()));
        if (req.getEndAt() != null) event.setEndAt(OffsetDateTime.parse(req.getEndAt()));
        if (req.getXpRewardPerCorrect() > 0) event.setXpRewardPerCorrect(req.getXpRewardPerCorrect());
        if (req.getCourseId() != null) event.setCourseId(req.getCourseId());
        if (req.getMinGuildSize() > 0) event.setMinGuildSize(req.getMinGuildSize());

        if (req.getMapTemplateId() != null) {
            WarMapTemplate template = mapTemplateRepository.findById(req.getMapTemplateId())
                    .orElseThrow(() -> new RuntimeException("Template de mapa não encontrado"));
            event.setMapTemplate(template);
        }

        return mapToEventResponse(eventRepository.save(event), null, null, null, false);
    }

    @Transactional
    public void deleteEvent(UUID id) {
        WarDayEvent event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento não encontrado"));
        if ("ACTIVE".equals(event.getStatus())) {
            throw new RuntimeException("Não é possível deletar um evento ativo");
        }
        eventRepository.delete(event);
    }

    @Transactional
    public WarDayDTO.EventResponse forceStart(UUID id) {
        WarDayEvent event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento não encontrado"));
        if (!"UPCOMING".equals(event.getStatus())) {
            throw new RuntimeException("Somente eventos com status UPCOMING podem ser iniciados");
        }
        event.setStatus("ACTIVE");
        return mapToEventResponse(eventRepository.save(event), null, null, null, false);
    }

    @Transactional
    public WarDayDTO.EventResponse forceEnd(UUID id) {
        WarDayEvent event = eventRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Evento não encontrado"));
        if (!"ACTIVE".equals(event.getStatus())) {
            throw new RuntimeException("Somente eventos ativos podem ser encerrados");
        }
        event.setStatus("FINISHED");
        eventRepository.save(event);
        return mapToEventResponse(event, null, null, null, false);
    }

    // ─── Admin: Map Templates ─────────────────────────────────────────────────

    @Transactional
    public WarDayDTO.MapTemplateResponse createMapTemplate(WarDayDTO.MapTemplateCreateRequest req) {
        WarMapTemplate template = WarMapTemplate.builder()
                .name(req.getName())
                .description(req.getDescription())
                .build();
        template = mapTemplateRepository.save(template);

        if (req.getZones() != null) {
            for (WarDayDTO.ZoneTemplateCreateRequest zoneReq : req.getZones()) {
                WarZoneTemplate zone = buildZoneFromRequest(template, zoneReq);
                zoneTemplateRepository.save(zone);
            }
        }

        return mapToTemplateResponse(mapTemplateRepository.findById(template.getId()).orElseThrow());
    }

    @Transactional
    public WarDayDTO.MapTemplateResponse updateMapTemplate(UUID id, WarDayDTO.MapTemplateCreateRequest req) {
        WarMapTemplate template = mapTemplateRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Template não encontrado"));
        template.setName(req.getName());
        if (req.getDescription() != null) template.setDescription(req.getDescription());

        if (req.getZones() != null) {
            zoneTemplateRepository.deleteAll(zoneTemplateRepository.findAllByMapTemplateIdOrderByDisplayOrderAsc(id));
            for (WarDayDTO.ZoneTemplateCreateRequest zoneReq : req.getZones()) {
                zoneTemplateRepository.save(buildZoneFromRequest(template, zoneReq));
            }
        }

        mapTemplateRepository.save(template);
        return mapToTemplateResponse(mapTemplateRepository.findById(id).orElseThrow());
    }

    private WarZoneTemplate buildZoneFromRequest(WarMapTemplate template, WarDayDTO.ZoneTemplateCreateRequest req) {
        return WarZoneTemplate.builder()
                .mapTemplate(template)
                .name(req.getName())
                .zoneType(req.getZoneType() != null ? req.getZoneType() : "CAMP")
                .difficultyLevel(req.getDifficultyLevel() > 0 ? req.getDifficultyLevel() : 1)
                .positionX(req.getPositionX())
                .positionY(req.getPositionY())
                .questionCount(req.getQuestionCount() > 0 ? req.getQuestionCount() : 10)
                .pointsPerCorrect(req.getPointsPerCorrect() > 0 ? req.getPointsPerCorrect() : 10)
                .terrainType(req.getTerrainType() != null ? req.getTerrainType() : "PLAINS")
                .displayOrder(req.getDisplayOrder())
                .prerequisiteZoneIds(req.getPrerequisiteZoneIds() != null ? req.getPrerequisiteZoneIds() : new HashSet<>())
                .build();
    }

    // ─── Queries ──────────────────────────────────────────────────────────────

    public List<WarDayDTO.EventResponse> listAllEvents() {
        return eventRepository.findAll().stream()
                .sorted(Comparator.comparing(WarDayEvent::getStartAt).reversed())
                .map(e -> mapToEventResponse(e, null, null, null, false))
                .collect(Collectors.toList());
    }

    public List<WarDayDTO.MapTemplateResponse> listMapTemplates() {
        return mapTemplateRepository.findAll().stream()
                .map(this::mapToTemplateResponse)
                .collect(Collectors.toList());
    }

    public Optional<WarDayEvent> findActiveEvent() {
        return eventRepository.findActiveEvent();
    }

    public Optional<WarDayEvent> findById(UUID id) {
        return eventRepository.findById(id);
    }

    public List<WarDayDTO.EventResponse> listUpcomingAndActive() {
        return eventRepository.findUpcomingAndActive().stream()
                .map(e -> mapToEventResponse(e, null, null, null, false))
                .collect(Collectors.toList());
    }

    public WarDayDTO.EventResponse getEventResponse(WarDayEvent event, UUID guildId) {
        GuildWarSession session = guildId != null
                ? sessionRepository.findByWarDayEventIdAndGuildId(event.getId(), guildId).orElse(null)
                : null;
        return mapToEventResponse(event,
                session != null ? session.getTotalScore() : null,
                session != null ? session.getZonesConquered() : null,
                session,
                session != null);
    }

    public List<WarDayDTO.GuildRankingEntry> getAdminRankings(UUID eventId) {
        List<WarDayRanking> rankings = rankingRepository.findAllByWarDayEventIdOrderByFinalPositionAsc(eventId);
        if (!rankings.isEmpty()) {
            return rankings.stream().map(r -> WarDayDTO.GuildRankingEntry.builder()
                    .position(r.getFinalPosition())
                    .guildId(r.getGuildId())
                    .guildName(r.getGuildName())
                    .guildBadge(r.getGuildBadge())
                    .totalScore(r.getFinalScore())
                    .zonesConquered(r.getZonesConquered())
                    .build()
            ).collect(Collectors.toList());
        }
        // Live ranking for active events
        List<GuildWarSession> sessions = sessionRepository.findRankingByEventId(eventId);
        List<WarDayDTO.GuildRankingEntry> result = new ArrayList<>();
        for (int i = 0; i < sessions.size(); i++) {
            GuildWarSession s = sessions.get(i);
            result.add(WarDayDTO.GuildRankingEntry.builder()
                    .position(i + 1)
                    .guildId(s.getGuild().getId())
                    .guildName(s.getGuild().getName())
                    .guildBadge(s.getGuild().getBadge())
                    .totalScore(s.getTotalScore())
                    .zonesConquered(s.getZonesConquered())
                    .build());
        }
        return result;
    }

    // ─── Mappers ──────────────────────────────────────────────────────────────

    public WarDayDTO.EventResponse mapToEventResponse(WarDayEvent event, Long guildScore,
            Integer guildZones, GuildWarSession session, boolean guildJoined) {
        return WarDayDTO.EventResponse.builder()
                .id(event.getId())
                .title(event.getTitle())
                .description(event.getDescription())
                .status(event.getStatus())
                .startAt(event.getStartAt() != null ? event.getStartAt().toString() : null)
                .endAt(event.getEndAt() != null ? event.getEndAt().toString() : null)
                .xpRewardPerCorrect(event.getXpRewardPerCorrect())
                .minGuildSize(event.getMinGuildSize())
                .courseId(event.getCourseId())
                .mapTemplate(event.getMapTemplate() != null ? mapToTemplateResponse(event.getMapTemplate()) : null)
                .guildJoined(guildJoined)
                .guildScore(guildScore)
                .guildZonesConquered(guildZones)
                .build();
    }

    public WarDayDTO.MapTemplateResponse mapToTemplateResponse(WarMapTemplate template) {
        List<WarZoneTemplate> zones = zoneTemplateRepository.findAllByMapTemplateIdOrderByDisplayOrderAsc(template.getId());
        return WarDayDTO.MapTemplateResponse.builder()
                .id(template.getId())
                .name(template.getName())
                .description(template.getDescription())
                .createdAt(template.getCreatedAt() != null ? template.getCreatedAt().toString() : null)
                .zones(zones.stream().map(this::mapToZoneTemplateResponse).collect(Collectors.toList()))
                .build();
    }

    public WarDayDTO.ZoneTemplateResponse mapToZoneTemplateResponse(WarZoneTemplate zone) {
        return WarDayDTO.ZoneTemplateResponse.builder()
                .id(zone.getId())
                .name(zone.getName())
                .zoneType(zone.getZoneType())
                .difficultyLevel(zone.getDifficultyLevel())
                .positionX(zone.getPositionX())
                .positionY(zone.getPositionY())
                .questionCount(zone.getQuestionCount())
                .pointsPerCorrect(zone.getPointsPerCorrect())
                .terrainType(zone.getTerrainType())
                .displayOrder(zone.getDisplayOrder())
                .prerequisiteZoneIds(zone.getPrerequisiteZoneIds())
                .build();
    }
}
