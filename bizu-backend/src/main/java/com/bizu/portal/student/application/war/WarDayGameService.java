package com.bizu.portal.student.application.war;

import com.bizu.portal.content.domain.Question;
import com.bizu.portal.content.infrastructure.QuestionRepository;
import com.bizu.portal.student.api.war.WarDayDTO;
import com.bizu.portal.student.domain.war.*;
import com.bizu.portal.student.guild.domain.Guild;
import com.bizu.portal.student.guild.repository.GuildMemberRepository;
import com.bizu.portal.student.guild.repository.GuildRepository;
import com.bizu.portal.student.infrastructure.war.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WarDayGameService {

    private final WarDayEventRepository eventRepository;
    private final GuildWarSessionRepository sessionRepository;
    private final WarZoneProgressRepository progressRepository;
    private final WarZoneAttemptRepository attemptRepository;
    private final WarZoneTemplateRepository zoneTemplateRepository;
    private final QuestionRepository questionRepository;
    private final GuildMemberRepository guildMemberRepository;
    private final GuildRepository guildRepository;
    private final SimpMessagingTemplate messagingTemplate;

    private static final double CONQUEST_THRESHOLD = 0.7;

    // ─── Join Event ───────────────────────────────────────────────────────────

    @Transactional
    public WarDayDTO.GuildMapState joinEvent(UUID eventId, UUID guildId) {
        WarDayEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento não encontrado"));

        if (!"ACTIVE".equals(event.getStatus())) {
            throw new RuntimeException("O War Day não está ativo no momento");
        }

        Optional<GuildWarSession> existing = sessionRepository.findByWarDayEventIdAndGuildId(eventId, guildId);
        if (existing.isPresent()) {
            return buildMapState(existing.get(), event);
        }

        Guild guild = guildRepository.findById(guildId)
                .orElseThrow(() -> new RuntimeException("Guild não encontrada"));

        GuildWarSession session = GuildWarSession.builder()
                .warDayEvent(event)
                .guild(guild)
                .totalScore(0)
                .zonesConquered(0)
                .status("ACTIVE")
                .build();
        session = sessionRepository.save(session);

        // Initialize zone progress for this guild
        initializeZoneProgress(session, event);

        broadcastRankingUpdate(eventId);
        return buildMapState(session, event);
    }

    private void initializeZoneProgress(GuildWarSession session, WarDayEvent event) {
        if (event.getMapTemplate() == null) return;

        List<WarZoneTemplate> zones = zoneTemplateRepository
                .findAllByMapTemplateIdOrderByDisplayOrderAsc(event.getMapTemplate().getId());

        for (WarZoneTemplate zone : zones) {
            String initialStatus = zone.getPrerequisiteZoneIds().isEmpty() ? "AVAILABLE" : "LOCKED";
            WarZoneProgress progress = WarZoneProgress.builder()
                    .guildWarSession(session)
                    .zoneTemplate(zone)
                    .status(initialStatus)
                    .questionsAnswered(0)
                    .correctAnswers(0)
                    .totalPoints(0)
                    .build();
            progressRepository.save(progress);
        }
    }

    // ─── Get Map State ────────────────────────────────────────────────────────

    public WarDayDTO.GuildMapState getMapState(UUID eventId, UUID guildId) {
        WarDayEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento não encontrado"));

        GuildWarSession session = sessionRepository.findByWarDayEventIdAndGuildId(eventId, guildId)
                .orElseThrow(() -> new RuntimeException("Sua guild ainda não entrou neste evento. Clique em 'Entrar na Guerra'"));

        return buildMapState(session, event);
    }

    // ─── Get Question ─────────────────────────────────────────────────────────

    @Transactional
    public WarDayDTO.QuestionResponse getQuestion(UUID eventId, UUID zoneId, UUID guildId) {
        WarDayEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento não encontrado"));
        if (!"ACTIVE".equals(event.getStatus())) {
            throw new RuntimeException("O War Day não está ativo");
        }

        GuildWarSession session = sessionRepository.findByWarDayEventIdAndGuildId(eventId, guildId)
                .orElseThrow(() -> new RuntimeException("Sua guild não está participando deste evento"));

        WarZoneProgress progress = progressRepository
                .findByGuildWarSessionIdAndZoneTemplateId(session.getId(), zoneId)
                .orElseThrow(() -> new RuntimeException("Zona não encontrada na sessão da guild"));

        if ("CONQUERED".equals(progress.getStatus())) {
            throw new RuntimeException("Esta zona já foi conquistada pela sua guild!");
        }
        if ("LOCKED".equals(progress.getStatus())) {
            throw new RuntimeException("Esta zona ainda está bloqueada. Complete as zonas anteriores primeiro.");
        }

        // Update status to IN_PROGRESS if AVAILABLE
        if ("AVAILABLE".equals(progress.getStatus())) {
            progress.setStatus("IN_PROGRESS");
            progressRepository.save(progress);
        }

        WarZoneTemplate zone = progress.getZoneTemplate();
        String difficulty = difficultyFromLevel(zone.getDifficultyLevel());

        // Get a random question that this player hasn't answered yet in this zone
        List<Question> candidates = questionRepository.findRandomByCategory("QUIZ", 20);
        if (candidates.isEmpty()) {
            candidates = questionRepository.findRandomByCategory("SIMULADO", 20);
        }

        // Filter out questions already answered by this guild in this zone
        List<UUID> answeredInZone = attemptRepository.findAllByZoneProgressId(progress.getId())
                .stream().map(WarZoneAttempt::getQuestionId).collect(Collectors.toList());

        Question question = candidates.stream()
                .filter(q -> !answeredInZone.contains(q.getId()))
                .filter(q -> difficulty.equals(q.getDifficulty()) || q.getDifficulty() == null)
                .findFirst()
                .orElseGet(() -> candidates.stream()
                        .filter(q -> !answeredInZone.contains(q.getId()))
                        .findFirst()
                        .orElseGet(() -> candidates.get(0)));

        return WarDayDTO.QuestionResponse.builder()
                .questionId(question.getId())
                .statement(question.getStatement())
                .options(question.getOptions())
                .imageBase64(question.getImageBase64())
                .difficulty(question.getDifficulty())
                .questionsAnswered(progress.getQuestionsAnswered())
                .correctAnswers(progress.getCorrectAnswers())
                .questionCount(zone.getQuestionCount())
                .zoneStatus(progress.getStatus())
                .build();
    }

    // ─── Submit Answer ────────────────────────────────────────────────────────

    @Transactional
    public WarDayDTO.AnswerResult submitAnswer(UUID eventId, UUID zoneId, UUID guildId, UUID userId,
            WarDayDTO.AnswerRequest req) {
        WarDayEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento não encontrado"));
        if (!"ACTIVE".equals(event.getStatus())) {
            throw new RuntimeException("O War Day não está ativo");
        }

        GuildWarSession session = sessionRepository.findByWarDayEventIdAndGuildId(eventId, guildId)
                .orElseThrow(() -> new RuntimeException("Guild não está participando"));

        // Pessimistic lock to prevent race conditions
        WarZoneProgress progress = progressRepository
                .findBySessionAndZoneForUpdate(session.getId(), zoneId)
                .orElseThrow(() -> new RuntimeException("Zona não encontrada"));

        if ("CONQUERED".equals(progress.getStatus())) {
            throw new RuntimeException("Esta zona já foi conquistada!");
        }
        if ("LOCKED".equals(progress.getStatus())) {
            throw new RuntimeException("Esta zona está bloqueada");
        }

        WarZoneTemplate zone = progress.getZoneTemplate();

        // Fetch the question to validate the answer
        Question question = questionRepository.findById(req.getQuestionId())
                .orElseThrow(() -> new RuntimeException("Questão não encontrada"));

        boolean correct = question.getCorrectOption() != null
                && question.getCorrectOption().equalsIgnoreCase(req.getSelectedAnswer());

        int pointsEarned = correct ? zone.getPointsPerCorrect() : 0;

        // Record attempt
        WarZoneAttempt attempt = WarZoneAttempt.builder()
                .zoneProgress(progress)
                .userId(userId)
                .questionId(req.getQuestionId())
                .selectedAnswer(req.getSelectedAnswer())
                .correct(correct)
                .pointsEarned(pointsEarned)
                .build();
        attemptRepository.save(attempt);

        // Update progress counters
        progress.setQuestionsAnswered(progress.getQuestionsAnswered() + 1);
        if (correct) {
            progress.setCorrectAnswers(progress.getCorrectAnswers() + 1);
            progress.setTotalPoints(progress.getTotalPoints() + pointsEarned);
        }

        // Check conquest condition: enough correct answers
        int required = (int) Math.ceil(zone.getQuestionCount() * CONQUEST_THRESHOLD);
        boolean zoneConquered = progress.getCorrectAnswers() >= required;

        List<UUID> newlyUnlockedZones = new ArrayList<>();

        if (zoneConquered && !"CONQUERED".equals(progress.getStatus())) {
            progress.setStatus("CONQUERED");
            progress.setConqueredAt(OffsetDateTime.now());

            // Update guild session score
            session.setTotalScore(session.getTotalScore() + progress.getTotalPoints());
            session.setZonesConquered(session.getZonesConquered() + 1);
            sessionRepository.save(session);

            // Unlock adjacent zones
            newlyUnlockedZones = unlockAdjacentZones(session, zone);

            // Broadcast map update to guild
            broadcastMapUpdate(guildId, zone, newlyUnlockedZones, session, "ZONE_CONQUERED", null);
            broadcastRankingUpdate(eventId);

            log.info("Zone '{}' conquered by guild '{}'", zone.getName(), guildId);
        } else {
            // Update session score incrementally for live ranking
            session.setTotalScore(session.getTotalScore() + pointsEarned);
            sessionRepository.save(session);
        }

        progressRepository.save(progress);

        return WarDayDTO.AnswerResult.builder()
                .correct(correct)
                .correctAnswer(question.getCorrectOption())
                .resolution(question.getResolution())
                .pointsEarned(pointsEarned)
                .correctAnswers(progress.getCorrectAnswers())
                .questionsAnswered(progress.getQuestionsAnswered())
                .questionCount(zone.getQuestionCount())
                .zoneStatus(progress.getStatus())
                .guildTotalScore(session.getTotalScore())
                .zoneConquered(zoneConquered)
                .newlyUnlockedZones(newlyUnlockedZones)
                .build();
    }

    // ─── Zone Unlocking ───────────────────────────────────────────────────────

    private List<UUID> unlockAdjacentZones(GuildWarSession session, WarZoneTemplate conqueredZone) {
        List<WarZoneTemplate> allZones = zoneTemplateRepository
                .findAllByMapTemplateIdOrderByDisplayOrderAsc(conqueredZone.getMapTemplate().getId());

        List<UUID> unlocked = new ArrayList<>();
        List<WarZoneProgress> allProgress = progressRepository.findAllByGuildWarSessionId(session.getId());
        Set<UUID> conqueredZoneIds = allProgress.stream()
                .filter(p -> "CONQUERED".equals(p.getStatus()))
                .map(p -> p.getZoneTemplate().getId())
                .collect(Collectors.toSet());

        for (WarZoneTemplate candidate : allZones) {
            if (!candidate.getPrerequisiteZoneIds().isEmpty()
                    && conqueredZoneIds.containsAll(candidate.getPrerequisiteZoneIds())) {
                allProgress.stream()
                        .filter(p -> p.getZoneTemplate().getId().equals(candidate.getId()))
                        .filter(p -> "LOCKED".equals(p.getStatus()))
                        .forEach(p -> {
                            p.setStatus("AVAILABLE");
                            progressRepository.save(p);
                            unlocked.add(candidate.getId());
                        });
            }
        }
        return unlocked;
    }

    // ─── Live Ranking ─────────────────────────────────────────────────────────

    public WarDayDTO.RankingResponse getLiveRanking(UUID eventId, UUID myGuildId) {
        WarDayEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento não encontrado"));

        List<GuildWarSession> sessions = sessionRepository.findRankingByEventId(eventId);
        List<WarDayDTO.GuildRankingEntry> ranking = new ArrayList<>();
        for (int i = 0; i < sessions.size(); i++) {
            GuildWarSession s = sessions.get(i);
            ranking.add(WarDayDTO.GuildRankingEntry.builder()
                    .position(i + 1)
                    .guildId(s.getGuild().getId())
                    .guildName(s.getGuild().getName())
                    .guildBadge(s.getGuild().getBadge())
                    .totalScore(s.getTotalScore())
                    .zonesConquered(s.getZonesConquered())
                    .isMyGuild(s.getGuild().getId().equals(myGuildId))
                    .build());
        }

        return WarDayDTO.RankingResponse.builder()
                .eventId(eventId)
                .eventTitle(event.getTitle())
                .eventStatus(event.getStatus())
                .guilds(ranking)
                .build();
    }

    // ─── WebSocket Broadcasting ───────────────────────────────────────────────

    private void broadcastMapUpdate(UUID guildId, WarZoneTemplate zone, List<UUID> newlyUnlocked,
            GuildWarSession session, String type, String conqueredBy) {
        WarDayDTO.MapUpdateEvent event = WarDayDTO.MapUpdateEvent.builder()
                .type(type)
                .zoneId(zone.getId())
                .zoneName(zone.getName())
                .newStatus("CONQUERED")
                .newlyUnlockedZones(newlyUnlocked)
                .guildTotalScore(session.getTotalScore())
                .zonesConquered(session.getZonesConquered())
                .conqueredByNickname(conqueredBy)
                .build();
        messagingTemplate.convertAndSend("/topic/war-day/" + guildId + "/map", event);
    }

    private void broadcastRankingUpdate(UUID eventId) {
        try {
            List<GuildWarSession> sessions = sessionRepository.findRankingByEventId(eventId);
            List<WarDayDTO.GuildRankingEntry> ranking = new ArrayList<>();
            for (int i = 0; i < sessions.size(); i++) {
                GuildWarSession s = sessions.get(i);
                ranking.add(WarDayDTO.GuildRankingEntry.builder()
                        .position(i + 1)
                        .guildId(s.getGuild().getId())
                        .guildName(s.getGuild().getName())
                        .guildBadge(s.getGuild().getBadge())
                        .totalScore(s.getTotalScore())
                        .zonesConquered(s.getZonesConquered())
                        .build());
            }
            WarDayDTO.RankingUpdateEvent update = WarDayDTO.RankingUpdateEvent.builder()
                    .type("RANKING_UPDATE")
                    .ranking(ranking)
                    .build();
            messagingTemplate.convertAndSend("/topic/war-day/" + eventId + "/ranking", update);
        } catch (Exception e) {
            log.warn("Failed to broadcast ranking update: {}", e.getMessage());
        }
    }

    // ─── Helpers ──────────────────────────────────────────────────────────────

    private String difficultyFromLevel(int level) {
        return switch (level) {
            case 1 -> "EASY";
            case 2 -> "MEDIUM";
            case 3 -> "HARD";
            default -> "HARD";
        };
    }

    private WarDayDTO.GuildMapState buildMapState(GuildWarSession session, WarDayEvent event) {
        List<WarZoneProgress> progressList = progressRepository.findAllByGuildWarSessionId(session.getId());

        List<WarDayDTO.ZoneState> zoneStates = progressList.stream().map(p -> {
            WarZoneTemplate zone = p.getZoneTemplate();
            int required = (int) Math.ceil(zone.getQuestionCount() * CONQUEST_THRESHOLD);
            double progressPct = required > 0
                    ? Math.min(100.0, (p.getCorrectAnswers() * 100.0) / required)
                    : 0;

            return WarDayDTO.ZoneState.builder()
                    .zoneId(zone.getId())
                    .name(zone.getName())
                    .zoneType(zone.getZoneType())
                    .difficultyLevel(zone.getDifficultyLevel())
                    .positionX(zone.getPositionX())
                    .positionY(zone.getPositionY())
                    .questionCount(zone.getQuestionCount())
                    .pointsPerCorrect(zone.getPointsPerCorrect())
                    .terrainType(zone.getTerrainType())
                    .prerequisiteZoneIds(zone.getPrerequisiteZoneIds())
                    .status(p.getStatus())
                    .questionsAnswered(p.getQuestionsAnswered())
                    .correctAnswers(p.getCorrectAnswers())
                    .totalPoints(p.getTotalPoints())
                    .conqueredAt(p.getConqueredAt() != null ? p.getConqueredAt().toString() : null)
                    .progressPercent(progressPct)
                    .build();
        }).collect(Collectors.toList());

        return WarDayDTO.GuildMapState.builder()
                .eventId(event.getId())
                .guildId(session.getGuild().getId())
                .guildName(session.getGuild().getName())
                .totalScore(session.getTotalScore())
                .zonesConquered(session.getZonesConquered())
                .sessionStatus(session.getStatus())
                .zones(zoneStates)
                .build();
    }
}
