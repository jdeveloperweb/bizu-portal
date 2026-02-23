package com.bizu.portal.student.api;

import com.bizu.portal.student.domain.Duel;
import com.bizu.portal.student.infrastructure.DuelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/duelos")
@RequiredArgsConstructor
public class DuelController {

    private final DuelRepository duelRepository;

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
        Duel duel = duelRepository.findById(duelId).orElseThrow();
        duel.setStatus("IN_PROGRESS");
        return ResponseEntity.ok(duelRepository.save(duel));
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
        // Logic to invite a user and create a Duel record
        Duel duel = Duel.builder()
            .challenger(com.bizu.portal.identity.domain.User.builder().id(challengerId).build())
            .opponent(com.bizu.portal.identity.domain.User.builder().id(opponentId).build())
            .status("PENDING")
            .subject(subject)
            .build();
        return ResponseEntity.ok(duelRepository.save(duel));
    }

    @GetMapping("/ranking")
    public ResponseEntity<List<Object>> getDuelRanking() {
        // Separate ranking for duels
        return ResponseEntity.ok(List.of());
    }
}
