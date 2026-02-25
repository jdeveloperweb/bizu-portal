package com.bizu.portal.student.api;

import com.bizu.portal.identity.infrastructure.UserRepository;
import com.bizu.portal.shared.security.CourseContextHolder;
import com.bizu.portal.student.infrastructure.GamificationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.MediaType;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.util.Map;
import java.util.UUID;
import java.util.concurrent.ConcurrentHashMap;

/**
 * SSE endpoint for real-time updates: XP, streak, progress changes.
 * Used by frontend to update UI without reload during activities.
 */
@RestController
@RequestMapping("/api/v1/student/sse")
@RequiredArgsConstructor
@Slf4j
public class StudentProgressSSEController {

    private static final Map<UUID, SseEmitter> EMITTERS = new ConcurrentHashMap<>();

    private final UserRepository userRepository;
    private final GamificationRepository gamificationRepository;

    @GetMapping(value = "/progress", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter streamProgress(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = resolveUserId(jwt);
        SseEmitter emitter = new SseEmitter(300_000L); // 5 minutes timeout

        EMITTERS.put(userId, emitter);

        emitter.onCompletion(() -> EMITTERS.remove(userId));
        emitter.onTimeout(() -> EMITTERS.remove(userId));
        emitter.onError(e -> EMITTERS.remove(userId));

        // Send initial state
        try {
            gamificationRepository.findById(userId).ifPresent(stats -> {
                try {
                    emitter.send(SseEmitter.event()
                        .name("gamification")
                        .data(Map.of(
                            "xp", stats.getTotalXp(),
                            "streak", stats.getCurrentStreak(),
                            "maxStreak", stats.getMax_streak()
                        )));
                } catch (IOException e) {
                    log.debug("Failed to send initial SSE for user {}", userId);
                }
            });
        } catch (Exception e) {
            log.debug("Error sending initial SSE state", e);
        }

        return emitter;
    }

    /**
     * Push an update to a specific user's SSE stream.
     * Called by event listeners after state changes.
     */
    public static void pushUpdate(UUID userId, String eventName, Object data) {
        SseEmitter emitter = EMITTERS.get(userId);
        if (emitter != null) {
            try {
                emitter.send(SseEmitter.event().name(eventName).data(data));
            } catch (IOException e) {
                EMITTERS.remove(userId);
            }
        }
    }

    private UUID resolveUserId(Jwt jwt) {
        String email = jwt.getClaim("email");
        return userRepository.findByEmail(email)
            .map(u -> u.getId())
            .orElseThrow(() -> new RuntimeException("Usuário não encontrado"));
    }
}
