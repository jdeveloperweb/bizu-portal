package com.bizu.portal.student.application;

import com.bizu.portal.student.domain.Duel;
import com.bizu.portal.student.domain.DuelQuestion;
import com.bizu.portal.student.infrastructure.DuelQuestionRepository;
import com.bizu.portal.student.infrastructure.DuelRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Component
@RequiredArgsConstructor
@Slf4j
public class DuelScheduler {

    private final DuelRepository duelRepository;
    private final DuelQuestionRepository duelQuestionRepository;
    private final DuelService duelService;

    /**
     * Limpa duelos inativos onde um jogador "sumiu".
     * Roda a cada 2 minutos.
     */
    @Scheduled(fixedRate = 120000)
    @Transactional
    public void cleanupInactiveDuels() {
        // Duelos sem atividade há mais de 3 minutos
        OffsetDateTime timeoutLimit = OffsetDateTime.now().minusMinutes(3);
        List<Duel> staleDuels = duelRepository.findInactiveInProgressDuels(timeoutLimit);

        if (staleDuels.isEmpty()) return;

        log.info("Processando {} duelos inativos da Arena...", staleDuels.size());

        for (Duel duel : staleDuels) {
            try {
                DuelQuestion dq = duelQuestionRepository.findByDuelIdAndRoundNumber(duel.getId(), duel.getCurrentRound());
                
                if (dq == null) {
                    // Estado inconsistente, apenas cancela
                    duel.setStatus("CANCELLED");
                    duelRepository.save(duel);
                    continue;
                }

                // Identificar quem não respondeu
                if (dq.getChallengerAnswerIndex() != null && dq.getOpponentAnswerIndex() == null) {
                    // Oponente abandonou
                    log.info("Duelo {} detectado como abandono por inatividade (Oponente)", duel.getId());
                    duelService.declineOrAbandonDuelBySystem(duel.getId(), duel.getOpponent().getId());
                } else if (dq.getChallengerAnswerIndex() == null && dq.getOpponentAnswerIndex() != null) {
                    // Desafiante abandonou
                    log.info("Duelo {} detectado como abandono por inatividade (Desafiante)", duel.getId());
                    duelService.declineOrAbandonDuelBySystem(duel.getId(), duel.getChallenger().getId());
                } else {
                    // Ambos não responderam ou estado de transição
                    // Vamos penalizar quem tiver o 'lastSeenAt' mais antigo
                    OffsetDateTime cSeen = duel.getChallenger().getLastSeenAt();
                    OffsetDateTime oSeen = duel.getOpponent().getLastSeenAt();
                    
                    if (cSeen == null || (oSeen != null && cSeen.isBefore(oSeen))) {
                        duelService.declineOrAbandonDuelBySystem(duel.getId(), duel.getChallenger().getId());
                    } else {
                        duelService.declineOrAbandonDuelBySystem(duel.getId(), duel.getOpponent().getId());
                    }
                }
            } catch (Exception e) {
                log.error("Erro ao limpar duelo inativo {}: {}", duel.getId(), e.getMessage());
            }
        }
    }
}
