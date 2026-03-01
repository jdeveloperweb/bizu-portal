package com.bizu.portal.student.application;

import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.UserRepository;
import com.bizu.portal.student.domain.SimuladoResult;
import com.bizu.portal.student.infrastructure.DuelRepository;
import com.bizu.portal.student.infrastructure.SimuladoResultRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.PageRequest;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.List;
import java.util.UUID;

@Component
@RequiredArgsConstructor
@Slf4j
public class RankingScheduler {

    private final SimuladoResultRepository resultRepository;
    private final DuelRepository duelRepository;
    private final com.bizu.portal.content.infrastructure.CourseRepository courseRepository;
    private final GamificationService gamificationService;
    private final NotificationService notificationService;

    /**
     * Roda todo Sábado às 23:59 para fechar o ranking da semana.
     */
    @Scheduled(cron = "0 59 23 * * SAT")
    @Transactional
    public void processWeeklyRanking() {
        log.info("Iniciando processamento do ranking semanal de simulados...");
        
        OffsetDateTime startOfWeek = OffsetDateTime.now().minusDays(7);
        List<SimuladoResult> weeklyResults = resultRepository.findAllByCompletedAtAfter(startOfWeek);

        // Sort by score descending
        weeklyResults.sort(Comparator.comparingInt(SimuladoResult::getScore).reversed());

        // Process top 10
        int limit = Math.min(weeklyResults.size(), 10);
        for (int i = 0; i < limit; i++) {
            SimuladoResult result = weeklyResults.get(i);
            User user = result.getUser();
            int position = i + 1;

            // Update position in the record for history
            result.setPositionInRanking(position);
            resultRepository.save(result);

            // Give rewards
            int xpReward = calculateXpReward(position);
            gamificationService.addXp(user.getId(), xpReward);

            // Notify user
            notificationService.send(user.getId(), "🏆 Ranking Semanal", 
                "Parabéns! Você ficou em #" + position + " no simulado da semana e ganhou " + xpReward + " XP!");
            
            log.info("Usuário {} premiado na posição #{}", user.getEmail(), position);
        }

        log.info("Ranking semanal processado com sucesso.");
    }

    /**
     * Roda todo Sábado às 23:55 para premiar os vencedores da Arena.
     */
    @Scheduled(cron = "0 55 23 * * SAT")
    @Transactional
    public void processWeeklyDuelRanking() {
        log.info("Iniciando processamento do ranking semanal de duelos por curso...");
        
        List<com.bizu.portal.content.domain.Course> courses = courseRepository.findAll();
        
        for (com.bizu.portal.content.domain.Course course : courses) {
            log.info("Processando ranking para o curso: {}", course.getTitle());
            List<Object[]> ranking = duelRepository.getWeeklyRanking(course.getId(), PageRequest.of(0, 10)).getContent();
            
            for (int i = 0; i < ranking.size(); i++) {
                Object[] r = ranking.get(i);
                UUID userId = (UUID) r[0];
                int position = i + 1;
                
                int xpReward = switch (position) {
                    case 1 -> 500;
                    case 2 -> 300;
                    case 3 -> 200;
                    default -> 0;
                };

                if (xpReward > 0) {
                    gamificationService.addXp(userId, xpReward);
                    notificationService.send(userId, "🏆 Ranking Arena - " + course.getTitle(), 
                        "Parabéns! Você ficou em #" + position + " na Arena (" + course.getTitle() + ") esta semana e ganhou " + xpReward + " XP!");
                    log.info("Usuário {} premiado na Arena do curso {} na posição #{}", userId, course.getTitle(), position);
                }
            }
        }
    }

    private int calculateXpReward(int position) {
        return switch (position) {
            case 1 -> 1000;
            case 2 -> 750;
            case 3 -> 500;
            default -> 200;
        };
    }
}
