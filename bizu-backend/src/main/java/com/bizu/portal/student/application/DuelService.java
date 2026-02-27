package com.bizu.portal.student.application;

import com.bizu.portal.content.domain.Question;
import com.bizu.portal.content.infrastructure.QuestionRepository;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.UserRepository;
import com.bizu.portal.student.domain.Duel;
import com.bizu.portal.student.domain.DuelQuestion;
import com.bizu.portal.student.infrastructure.DuelQuestionRepository;
import com.bizu.portal.student.infrastructure.DuelRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Random;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@lombok.extern.slf4j.Slf4j
public class DuelService {

    private final DuelRepository duelRepository;
    private final DuelQuestionRepository duelQuestionRepository;
    private final QuestionRepository questionRepository;
    private final NotificationService notificationService;
    private final GamificationService gamificationService;
    private final UserRepository userRepository;

    @Transactional
    public Duel createDuel(UUID challengerId, UUID opponentId, String subject) {
        log.info("Creating duel: challenger={}, opponent={}, subject={}", challengerId, opponentId, subject);
        User challenger = userRepository.findById(challengerId)
                .orElseThrow(() -> new RuntimeException("Challenger not found"));
        User opponent = userRepository.findById(opponentId)
                .orElseThrow(() -> new RuntimeException("Opponent not found"));

        Duel duel = Duel.builder()
                .challenger(challenger)
                .opponent(opponent)
                .subject(subject)
                .status("PENDING")
                .build();

        duel = duelRepository.save(duel);
        
        // Notify opponent
        notificationService.send(opponentId, "Novo Desafio!", "Você foi desafiado para um duelo em " + subject);
        
        initializeDuel(duel);
        return duel;
    }

    @Transactional
    public Duel acceptDuel(UUID duelId) {
        log.info("Accepting duel: {}", duelId);
        Duel duel = duelRepository.findById(duelId).orElseThrow();
        
        // Force initialization of LAZY proxies to avoid serialization issues
        if (duel.getChallenger() != null) duel.getChallenger().getName();
        if (duel.getOpponent() != null) duel.getOpponent().getName();
        
        duel.setStatus("IN_PROGRESS");
        duel.setCurrentRound(1);
        
        String subject = "Aleatorio".equalsIgnoreCase(duel.getSubject()) ? null : duel.getSubject();
        log.info("Duel subject: {}", subject);
        
        // Select initial 10 questions: 3 Easy, 4 Medium, 3 Hard
        List<Question> easy = questionRepository.findByFilters(null, null, subject, null, "EASY", "SIMULADO", org.springframework.data.domain.PageRequest.of(0, 100)).getContent();
        List<Question> medium = questionRepository.findByFilters(null, null, subject, null, "MEDIUM", "SIMULADO", org.springframework.data.domain.PageRequest.of(0, 100)).getContent();
        List<Question> hard = questionRepository.findByFilters(null, null, subject, null, "HARD", "SIMULADO", org.springframework.data.domain.PageRequest.of(0, 100)).getContent();
        
        log.info("Initial questions pools sizes: easy={}, medium={}, hard={}", easy.size(), medium.size(), hard.size());

        // Fallback to any difficulty if specific ones are empty
        if (easy.isEmpty()) {
            easy = questionRepository.findByFilters(null, null, subject, null, null, "SIMULADO", org.springframework.data.domain.PageRequest.of(0, 100)).getContent();
            log.info("Fallback SIMULADO pool size: {}", easy.size());
        }
        if (medium.isEmpty()) medium = easy;
        if (hard.isEmpty()) hard = medium;

        // Ultimate fallback — Any question if everything above failed
        if (easy.isEmpty()) {
            easy = questionRepository.findAll();
            log.info("Ultimate fallback (all questions) size: {}", easy.size());
        }
        if (medium.isEmpty()) medium = easy;
        if (hard.isEmpty()) hard = medium;
        java.util.List<DuelQuestion> duelQuestions = new java.util.ArrayList<>();
        Random rand = new Random();
        for (int i = 1; i <= 10; i++) {
            List<Question> pool = i <= 3 ? easy : i <= 7 ? medium : hard;
            if (pool == null || pool.isEmpty()) pool = easy; 
            if (pool == null || pool.isEmpty()) pool = questionRepository.findAll();
            
            if (pool.isEmpty()) {
                 log.warn("Pool is still empty for round {}", i);
                 continue; 
            }

            Question q = pool.get(rand.nextInt(pool.size()));
            DuelQuestion dq = DuelQuestion.builder()
                    .duel(duel)
                    .question(q)
                    .roundNumber(i)
                    .difficulty(i <= 3 ? "EASY" : i <= 7 ? "MEDIUM" : "HARD")
                    .build();
            duelQuestions.add(duelQuestionRepository.save(dq));
        }
        
        log.info("Duel {} started with {} questions", duelId, duelQuestions.size());
        
        if (duel.getQuestions() == null) {
            duel.setQuestions(new java.util.ArrayList<>());
        } else {
            duel.getQuestions().clear();
        }
        duel.getQuestions().addAll(duelQuestions);
        
        initializeDuel(duel);
        return duelRepository.save(duel);
    }

    @Transactional
    public Duel submitAnswer(UUID duelId, UUID userId, int answerIndex) {
        Duel duel = duelRepository.findById(duelId).orElseThrow();
        DuelQuestion currentRoundQuestion = duelQuestionRepository.findByDuelIdAndRoundNumber(duelId, duel.getCurrentRound());

        boolean isChallenger = duel.getChallenger().getId().equals(userId);
        
        // Convert integer index (0, 1, 2) to ('A', 'B', 'C') to match correctOption
        String answerStr = String.valueOf((char) ('A' + answerIndex));
        boolean isCorrect = answerStr.equals(currentRoundQuestion.getQuestion().getCorrectOption());

        if (isChallenger) {
            currentRoundQuestion.setChallengerAnswerIndex(answerIndex);
            currentRoundQuestion.setChallengerCorrect(isCorrect);
            if (isCorrect) duel.setChallengerScore(duel.getChallengerScore() + 1);
        } else {
            currentRoundQuestion.setOpponentAnswerIndex(answerIndex);
            currentRoundQuestion.setOpponentCorrect(isCorrect);
            if (isCorrect) duel.setOpponentScore(duel.getOpponentScore() + 1);
        }

        duelQuestionRepository.save(currentRoundQuestion);

        // Check if both have answered the current round
        if (currentRoundQuestion.getChallengerAnswerIndex() != null && currentRoundQuestion.getOpponentAnswerIndex() != null) {
            checkRoundResult(duel, currentRoundQuestion);
        }

        initializeDuel(duel);
        return duelRepository.save(duel);
    }

    @Transactional
    public Duel declineOrAbandonDuel(UUID duelId, UUID userId) {
        Duel duel = duelRepository.findById(duelId).orElseThrow();
        
        if ("IN_PROGRESS".equals(duel.getStatus())) {
            // Se estava em progresso e alguém saiu, o OUTRO vence
            User winner = duel.getChallenger().getId().equals(userId) 
                ? duel.getOpponent() 
                : duel.getChallenger();
            
            finishDuel(duel, winner);
            log.info("Duel {} abandoned by {}. Winner: {}", duelId, userId, winner.getId());
        } else {
            // Se ainda estava pendente (convite), apenas cancela
            duel.setStatus("CANCELLED");
            log.info("Duel {} declined by {}", duelId, userId);
        }
        
        initializeDuel(duel);
        return duelRepository.save(duel);
    }

    private void checkRoundResult(Duel duel, DuelQuestion dq) {
        int round = duel.getCurrentRound();
        boolean cCorrect = dq.getChallengerCorrect();
        boolean oCorrect = dq.getOpponentCorrect();

        if (round < 10) {
            // Standard rounds: just advance
            duel.setCurrentRound(round + 1);
        } else {
            // Shootout phase (from round 10 onwards)
            if (cCorrect && !oCorrect) {
                // Challenger wins
                finishDuel(duel, duel.getChallenger());
            } else if (!cCorrect && oCorrect) {
                // Opponent wins
                finishDuel(duel, duel.getOpponent());
            } else {
                // Both correct or both wrong: continue to next round with higher difficulty
                duel.setCurrentRound(round + 1);
                duel.setSuddenDeath(true);
                
                // Generate next question for sudden death
                generateSuddenDeathQuestion(duel, round + 1);
            }
        }
    }

    private void generateSuddenDeathQuestion(Duel duel, int roundNumber) {
        // Pick a HARD question for sudden death
        List<Question> questions = questionRepository.findAll(); // Filter by hard difficulty
        Question q = questions.get(new Random().nextInt(questions.size()));
        DuelQuestion dq = DuelQuestion.builder()
                .duel(duel)
                .question(q)
                .roundNumber(roundNumber)
                .difficulty("HARD")
                .build();
        duelQuestionRepository.save(dq);
    }

    private void finishDuel(Duel duel, User winner) {
        duel.setStatus("COMPLETED");
        duel.setWinner(winner);
        duel.setCompletedAt(OffsetDateTime.now());
        
        if (winner != null) {
            gamificationService.addXp(winner.getId(), 100);
            
            // Recompensa menor para o perdedor
            UUID loserId = duel.getChallenger().getId().equals(winner.getId()) 
                ? duel.getOpponent().getId() 
                : duel.getChallenger().getId();
            gamificationService.addXp(loserId, 25);
        } else {
            // Empate
            gamificationService.addXp(duel.getChallenger().getId(), 50);
            gamificationService.addXp(duel.getOpponent().getId(), 50);
        }
    }

    private void initializeDuel(Duel duel) {
        if (duel.getChallenger() != null) duel.getChallenger().getName();
        if (duel.getOpponent() != null) duel.getOpponent().getName();
        if (duel.getWinner() != null) duel.getWinner().getName();
        if (duel.getQuestions() != null) {
            duel.getQuestions().forEach(dq -> {
                if (dq.getQuestion() != null) {
                    dq.getQuestion().getStatement();
                    dq.getQuestion().getOptions().size();
                    dq.getQuestion().getCorrectOption();
                }
            });
        }
    }
}
