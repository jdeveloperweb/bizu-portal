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
    public ResponseEntity<List<Map<String, Object>>> getOnlineUsers(@RequestParam(required = false) UUID courseId) {
        String condition = courseId != null ? "JOIN commerce.course_entitlements ce ON u.id = ce.user_id WHERE ce.course_id = ? AND ce.active = true " : "";
        Object[] args = courseId != null ? new Object[]{courseId} : new Object[]{};
        
        String sql = """
            SELECT 
                u.id as "id",
                u.name as "name",
                u.avatar_url as "avatar",
                COALESCE(g.total_xp, 0) as "xp",
                FLOOR(POWER(COALESCE(g.total_xp, 0) / 1000.0, 2.0/3.0)) + 1 as "level",
                COALESCE(
                    (SELECT ROUND(COUNT(*) FILTER (WHERE winner_id = u.id AND status = 'COMPLETED') * 100.0 / NULLIF(COUNT(*) FILTER (WHERE status = 'COMPLETED'), 0)) 
                     FROM student.duels 
                     WHERE (challenger_id = u.id OR opponent_id = u.id)), 0
                ) as "winRate"
            FROM identity.users u
            LEFT JOIN student.gamification_stats g ON u.id = g.user_id
            """ + condition + """
            ORDER BY u.updated_at DESC
            LIMIT 10
            """;
        
        return ResponseEntity.ok(jdbcTemplate.queryForList(sql, args));
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
        return duelRepository.findActiveDuelByUserId(userId)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.noContent().build());
    }

    @PostMapping("/{duelId}/aceitar")
    public ResponseEntity<Duel> acceptDuel(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID duelId) {
        Duel duel = duelService.acceptDuel(duelId);
        // Notify both players that duel started
        messagingTemplate.convertAndSend("/topic/duelos/" + duelId, duel);
        return ResponseEntity.ok(duel);
    }

    @PostMapping("/{duelId}/recusar")
    public ResponseEntity<Void> declineDuel(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID duelId) {
        Duel duel = duelRepository.findById(duelId).orElseThrow();
        duel.setStatus("CANCELLED");
        duelRepository.save(duel);
        return ResponseEntity.ok().build();
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
        String email = jwt.getClaimAsString("email");
        String name = jwt.getClaimAsString("name");
        UUID subjectId = UUID.fromString(jwt.getSubject());
        return userService.syncUser(subjectId, email, name).getId();
    }

    @GetMapping("/{duelId}")
    public ResponseEntity<Duel> getDuel(@PathVariable UUID duelId) {
        return ResponseEntity.ok(duelRepository.findById(duelId).orElseThrow());
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<Object[]>> getDuelRanking() {
        return ResponseEntity.ok(duelRepository.getRanking());
    }
}
