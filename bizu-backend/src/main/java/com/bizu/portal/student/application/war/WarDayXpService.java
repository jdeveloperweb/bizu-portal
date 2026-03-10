package com.bizu.portal.student.application.war;

import com.bizu.portal.student.application.GamificationService;
import com.bizu.portal.student.domain.war.*;
import com.bizu.portal.student.guild.domain.GuildMember;
import com.bizu.portal.student.guild.repository.GuildMemberRepository;
import com.bizu.portal.student.infrastructure.war.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.*;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
public class WarDayXpService {

    private final WarDayEventRepository eventRepository;
    private final GuildWarSessionRepository sessionRepository;
    private final WarZoneAttemptRepository attemptRepository;
    private final WarDayRankingRepository rankingRepository;
    private final GuildMemberRepository guildMemberRepository;
    private final GamificationService gamificationService;

    @Transactional
    public void distributeXpAndFinalizeRankings(UUID eventId) {
        WarDayEvent event = eventRepository.findById(eventId)
                .orElseThrow(() -> new RuntimeException("Evento não encontrado"));

        List<GuildWarSession> sessions = sessionRepository.findRankingByEventId(eventId);
        if (sessions.isEmpty()) {
            log.info("No sessions found for War Day event {}", eventId);
            return;
        }

        // Build and save final rankings
        for (int i = 0; i < sessions.size(); i++) {
            GuildWarSession session = sessions.get(i);
            int position = i + 1;

            long correctTotal = attemptRepository.countCorrectByEventId(eventId);

            WarDayRanking ranking = WarDayRanking.builder()
                    .warDayEventId(eventId)
                    .guildId(session.getGuild().getId())
                    .guildName(session.getGuild().getName())
                    .guildBadge(session.getGuild().getBadge())
                    .finalScore(session.getTotalScore())
                    .zonesConquered(session.getZonesConquered())
                    .correctAnswersTotal((int) correctTotal)
                    .finalPosition(position)
                    .build();

            rankingRepository.save(ranking);
            session.setStatus("FINISHED");
            sessionRepository.save(session);
        }

        // Distribute XP only to the winning guild (position 1)
        GuildWarSession winnerSession = sessions.get(0);
        distributeXpToWinners(event, winnerSession);

        log.info("War Day {} finalized. Winner guild: {}", eventId, winnerSession.getGuild().getName());
    }

    private void distributeXpToWinners(WarDayEvent event, GuildWarSession winnerSession) {
        UUID guildId = winnerSession.getGuild().getId();
        List<GuildMember> members = guildMemberRepository.findAllByGuildId(guildId);

        int xpPerCorrect = event.getXpRewardPerCorrect();
        int totalXpDistributed = 0;

        for (GuildMember member : members) {
            UUID userId = member.getUser().getId();

            // Count correct answers for this user in the event
            Long userCorrectAnswers = attemptRepository.sumPointsBySessionAndUser(winnerSession.getId(), userId);
            if (userCorrectAnswers == null || userCorrectAnswers == 0) continue;

            // Each correct answer = xpPerCorrect XP bonus
            int xpToAward = (int) (userCorrectAnswers / event.getXpRewardPerCorrect() * xpPerCorrect);
            if (xpToAward <= 0) xpToAward = xpPerCorrect; // minimum reward for participation

            try {
                gamificationService.addXp(userId, xpToAward);
                totalXpDistributed += xpToAward;
                log.debug("Awarded {} XP to user {} for War Day victory", xpToAward, userId);
            } catch (Exception e) {
                log.warn("Failed to award XP to user {}: {}", userId, e.getMessage());
            }
        }

        // Update ranking with distributed XP
        rankingRepository.findByWarDayEventIdAndGuildId(event.getId(), guildId)
                .ifPresent(r -> {
                    r.setXpDistributed(totalXpDistributed);
                    rankingRepository.save(r);
                });

        log.info("Distributed total {} XP to winning guild {} members", totalXpDistributed, guildId);
    }
}
