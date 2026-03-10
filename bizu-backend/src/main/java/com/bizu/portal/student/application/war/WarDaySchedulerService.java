package com.bizu.portal.student.application.war;

import com.bizu.portal.student.domain.war.WarDayEvent;
import com.bizu.portal.student.infrastructure.war.WarDayEventRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class WarDaySchedulerService {

    private final WarDayEventRepository eventRepository;
    private final WarDayXpService xpService;
    private final SimpMessagingTemplate messagingTemplate;

    @Scheduled(fixedDelay = 60_000) // every minute
    @Transactional
    public void checkAndStartEvents() {
        List<WarDayEvent> toStart = eventRepository.findEventsToStart(OffsetDateTime.now());
        for (WarDayEvent event : toStart) {
            event.setStatus("ACTIVE");
            eventRepository.save(event);
            log.info("War Day event '{}' started automatically", event.getTitle());
            broadcastEventStatus(event.getId().toString(), "STARTED", event.getTitle());
        }
    }

    @Scheduled(fixedDelay = 60_000) // every minute
    @Transactional
    public void checkAndEndEvents() {
        List<WarDayEvent> toEnd = eventRepository.findEventsToEnd(OffsetDateTime.now());
        for (WarDayEvent event : toEnd) {
            event.setStatus("FINISHED");
            eventRepository.save(event);
            log.info("War Day event '{}' ended automatically, distributing XP...", event.getTitle());

            try {
                xpService.distributeXpAndFinalizeRankings(event.getId());
            } catch (Exception e) {
                log.error("Failed to distribute XP for event {}: {}", event.getId(), e.getMessage());
            }

            broadcastEventStatus(event.getId().toString(), "FINISHED", event.getTitle());
        }
    }

    private void broadcastEventStatus(String eventId, String status, String title) {
        try {
            messagingTemplate.convertAndSend(
                "/topic/war-day/" + eventId + "/status",
                Map.of("type", "EVENT_STATUS_CHANGE", "status", status, "title", title)
            );
        } catch (Exception e) {
            log.warn("Failed to broadcast event status: {}", e.getMessage());
        }
    }
}
