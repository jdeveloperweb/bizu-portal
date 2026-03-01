package com.bizu.portal.student.api;

import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.UserRepository;
import com.bizu.portal.student.application.DuelService;
import com.bizu.portal.student.domain.Duel;
import com.bizu.portal.student.infrastructure.DuelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/duelos")
@RequiredArgsConstructor
public class DuelController {

    private final DuelRepository duelRepository;
    private final DuelService duelService;
    private final UserRepository userRepository;
    private final UserService userService;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;
    private final org.springframework.jdbc.core.JdbcTemplate jdbcTemplate;

    @GetMapping("/online")
    public ResponseEntity<List<Map<String, Object>>> getOnlineUsers(@AuthenticationPrincipal Jwt jwt, @RequestParam(required = false) UUID courseId) {
        if (jwt != null) {
            resolveUserId(jwt);
        }
        String baseCondition = "WHERE u.last_seen_at > (NOW() - INTERVAL '60 seconds') ";
        String condition = courseId != null ? 
            "JOIN commerce.course_entitlements ce ON u.id = ce.user_id " + baseCondition + "AND ce.course_id = ? AND ce.active = true " : 
            baseCondition;
        Object[] args = courseId != null ? new Object[]{courseId} : new Object[]{};
        
        String sql = """
            SELECT 
                u.id as "id",
                u.name as "name",
                u.nickname as "nickname",
                u.avatar_url as "avatar",
                COALESCE(g.total_xp, 0) as "xp",
                FLOOR(POWER(COALESCE(g.total_xp, 0) / 1000.0, 2.0/3.0)) + 1 as "level",
                COALESCE(
                    (SELECT ROUND(COUNT(*) FILTER (WHERE winner_id = u.id AND status = 'COMPLETED') * 100.0 / NULLIF(COUNT(*) FILTER (WHERE status = 'COMPLETED'), 0)) 
                     FROM student.duels 
                     WHERE (challenger_id = u.id OR opponent_id = u.id)), 0
                ) as "winRate",
                COALESCE(
                    (SELECT 'em_duelo' FROM student.duels d 
                     WHERE (d.challenger_id = u.id OR d.opponent_id = u.id) 
                     AND d.status = 'IN_PROGRESS' LIMIT 1),
                    CASE WHEN u.duel_focus_mode THEN 'focado' ELSE 'online' END
                ) as "status"
            FROM identity.users u
            LEFT JOIN student.gamification_stats g ON u.id = g.user_id
            """ + condition + """
            ORDER BY u.last_seen_at DESC
            LIMIT 10
            """;
        
        return ResponseEntity.ok(jdbcTemplate.queryForList(sql, args));
    }

    @GetMapping("/online/count")
    public ResponseEntity<Map<String, Integer>> getOnlineUsersCount(@RequestParam(required = false) UUID courseId) {
        String baseCondition = "WHERE u.last_seen_at > (NOW() - INTERVAL '60 seconds') ";
        String condition = courseId != null ? 
            "JOIN commerce.course_entitlements ce ON u.id = ce.user_id " + baseCondition + "AND ce.course_id = ? AND ce.active = true " : 
            baseCondition;
        Object[] args = courseId != null ? new Object[]{courseId} : new Object[]{};
        
        String sql = """
            SELECT COUNT(u.id)
            FROM identity.users u
            """ + condition;
            
        Integer count = jdbcTemplate.queryForObject(sql, Integer.class, args);
        return ResponseEntity.ok(Map.of("count", count != null ? count : 0));
    }

    @GetMapping("/me/stats")
    public ResponseEntity<Map<String, Object>> getMyStats(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = resolveUserId(jwt);
        return ResponseEntity.ok(duelRepository.getMyDuelStats(userId));
    }

    @GetMapping("/pendentes")
    public ResponseEntity<List<Duel>> getPendingDuels(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = resolveUserId(jwt);
        return ResponseEntity.ok(duelRepository.findAllByOpponentIdAndStatus(userId, "PENDING"));
    }

    @GetMapping("/me/ativo")
    public ResponseEntity<Duel> getActiveDuel(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = resolveUserId(jwt);
        List<Duel> duels = duelRepository.findActiveDuelsByUserId(userId);
        if (duels.isEmpty()) {
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.ok(duels.get(0));
    }

    @PostMapping("/{duelId}/aceitar")
    public ResponseEntity<Duel> acceptDuel(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID duelId) {
        Duel duel = duelService.acceptDuel(duelId);
        // Notify both players that duel started
        messagingTemplate.convertAndSend("/topic/duelos/" + duelId, duel);
        return ResponseEntity.ok(duel);
    }

    @PostMapping("/{duelId}/recusar")
    public ResponseEntity<Duel> declineDuel(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID duelId) {
        UUID userId = resolveUserId(jwt);
        Duel duel = duelService.declineOrAbandonDuel(duelId, userId);
        messagingTemplate.convertAndSend("/topic/duelos/" + duelId, duel);
        return ResponseEntity.ok(duel);
    }

    @PostMapping("/desafiar")
    public ResponseEntity<Duel> createDuel(@AuthenticationPrincipal Jwt jwt, @RequestParam UUID opponentId, @RequestParam String subject) {
        UUID challengerId = resolveUserId(jwt);
        Duel duel = duelService.createDuel(challengerId, opponentId, subject);
        // Send real-time notification via WebSocket
        messagingTemplate.convertAndSend("/topic/desafios/" + opponentId, duel);
        return ResponseEntity.ok(duel);
    }

    @PostMapping("/{duelId}/responder")
    public ResponseEntity<Duel> submitAnswer(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID duelId, @RequestParam int answerIndex) {
        UUID userId = resolveUserId(jwt);
        Duel duel = duelService.submitAnswer(duelId, userId, answerIndex);
        // Send state update
        messagingTemplate.convertAndSend("/topic/duelos/" + duelId, duel);
        return ResponseEntity.ok(duel);
    }

    private UUID resolveUserId(Jwt jwt) {
        return userService.resolveUserId(jwt);
    }

    @GetMapping("/{duelId}")
    public ResponseEntity<Duel> getDuel(@PathVariable UUID duelId) {
        return ResponseEntity.ok(duelRepository.findById(duelId).orElseThrow());
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<Map<String, Object>>> getDuelRanking(@RequestParam(required = false) UUID courseId) {
        if (courseId == null) {
            return ResponseEntity.ok(List.of()); // Or handle as you wish, but user wants course ranking
        }
        List<Object[]> ranking = duelRepository.getWeeklyRanking(courseId);
        return ResponseEntity.ok(ranking.stream().map(r -> Map.of(
            "id", r[0],
            "name", r[1],
            "nickname", r[2] != null ? r[2] : "",
            "avatar", r[3] != null ? r[3] : "",
            "wins", r[4]
        )).collect(java.util.stream.Collectors.toList()));
    }

    @GetMapping("/historico")
    public ResponseEntity<List<Duel>> getDuelHistory(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = resolveUserId(jwt);
        return ResponseEntity.ok(duelRepository.findHistoryByUserId(userId));
    }

    @PostMapping("/heartbeat")
    public ResponseEntity<Void> heartbeat(@AuthenticationPrincipal Jwt jwt) {
        if (jwt != null) {
            resolveUserId(jwt);
        }
        return ResponseEntity.ok().build();
    }

    @PostMapping("/fila/entrar")
    public ResponseEntity<Void> joinQueue(@AuthenticationPrincipal Jwt jwt, @RequestParam UUID courseId) {
        UUID userId = resolveUserId(jwt);
        duelService.joinQueue(userId, courseId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/fila/sair")
    public ResponseEntity<Void> leaveQueue(@AuthenticationPrincipal Jwt jwt, @RequestParam UUID courseId) {
        UUID userId = resolveUserId(jwt);
        duelService.leaveQueue(userId, courseId);
        return ResponseEntity.ok().build();
    }
}
