package com.bizu.portal.student.api;

import com.bizu.portal.student.application.DuelService;
import com.bizu.portal.student.domain.Duel;
import com.bizu.portal.student.infrastructure.DuelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/duelos")
@RequiredArgsConstructor
public class DuelController {

    private final DuelRepository duelRepository;
    private final DuelService duelService;
    private final org.springframework.messaging.simp.SimpMessagingTemplate messagingTemplate;

    @GetMapping("/online")
    public ResponseEntity<List<String>> getOnlineUsers() {
        // Mock list for now
        return ResponseEntity.ok(List.of("Usuário 1", "Usuário 2", "Você"));
    }

    @GetMapping("/pendentes")
    public ResponseEntity<List<Duel>> getPendingDuels(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(duelRepository.findAllByOpponentIdAndStatus(userId, "PENDING"));
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
        UUID challengerId = UUID.fromString(jwt.getSubject());
        return ResponseEntity.ok(duelService.createDuel(challengerId, opponentId, subject));
    }

    @PostMapping("/{duelId}/responder")
    public ResponseEntity<Duel> submitAnswer(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID duelId, @RequestParam int answerIndex) {
        UUID userId = UUID.fromString(jwt.getSubject());
        Duel duel = duelService.submitAnswer(duelId, userId, answerIndex);
        // Send state update
        messagingTemplate.convertAndSend("/topic/duelos/" + duelId, duel);
        return ResponseEntity.ok(duel);
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
