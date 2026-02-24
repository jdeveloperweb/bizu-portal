package com.bizu.portal.student.application;

import com.bizu.portal.identity.domain.User;
import com.bizu.portal.student.domain.SimulationSession;
import com.bizu.portal.student.infrastructure.SimulationRepository;
import com.bizu.portal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class SimulationService {

    private final SimulationRepository simulationRepository;

    @Transactional
    public SimulationSession startSimulation(User user, String title, Integer questionsCount, Integer timeLimit) {
        SimulationSession session = SimulationSession.builder()
            .user(user)
            .title(title)
            .startTime(OffsetDateTime.now())
            .timeLimitMinutes(timeLimit)
            .totalQuestions(questionsCount)
            .status("IN_PROGRESS")
            .build();
            
        return simulationRepository.save(session);
    }

    @Transactional
    public SimulationSession finishSimulation(UUID sessionId) {
        SimulationSession session = simulationRepository.findById(sessionId)
            .orElseThrow(() -> new ResourceNotFoundException("Simulado não encontrado"));

        session.setEndTime(OffsetDateTime.now());
        session.setStatus("COMPLETED");
        
        // Final score calculation would be done here based on linked attempts
        if (session.getTotalQuestions() > 0) {
            double score = (double) session.getCorrectAnswers() / session.getTotalQuestions() * 100;
            session.setScorePercent(BigDecimal.valueOf(score));
        }

        return simulationRepository.save(session);
    }
}
