package com.bizu.portal.student.application;

import com.bizu.portal.content.domain.Course;
import com.bizu.portal.content.domain.Module;
import com.bizu.portal.content.domain.Question;
import com.bizu.portal.content.domain.Simulado;
import com.bizu.portal.content.infrastructure.QuestionRepository;
import com.bizu.portal.content.infrastructure.SimuladoRepository;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.shared.exception.ResourceNotFoundException;
import com.bizu.portal.student.domain.*;
import com.bizu.portal.student.infrastructure.ActivityAttemptRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationEventPublisher;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.time.temporal.IsoFields;
import java.util.List;
import java.util.UUID;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@RequiredArgsConstructor
@Slf4j
public class ActivityService {

    private final ActivityAttemptRepository attemptRepository;
    private final SimuladoRepository simuladoRepository;
    private final QuestionRepository questionRepository;
    private final ApplicationEventPublisher eventPublisher;
    private final GamificationService gamificationService;

    /**
     * Start an OfficialExam (Simulado) attempt.
     * Snapshots all questions at this moment — frozen in time.
     */
    @Transactional
    public ActivityAttempt startOfficialExam(User user, Course course, UUID simuladoId) {
        Simulado simulado = simuladoRepository.findById(simuladoId)
            .orElseThrow(() -> new ResourceNotFoundException("Simulado não encontrado"));

        // Check for existing active attempt
        attemptRepository.findActiveAttemptForSimulado(user.getId(), simuladoId)
            .ifPresent(existing -> {
                throw new IllegalStateException("Você já possui uma tentativa ativa para este simulado.");
            });

        // Calculate weekly cycle key for ranking
        OffsetDateTime now = OffsetDateTime.now();
        String weeklyKey = simulado.isWeeklyCycle()
            ? simuladoId + ":W" + now.get(IsoFields.WEEK_OF_WEEK_BASED_YEAR)
            : null;

        // Calculate time limit from simulado window
        Integer timeLimitSeconds = null;
        if (simulado.getEndDate() != null) {
            long remaining = java.time.Duration.between(now, simulado.getEndDate()).getSeconds();
            timeLimitSeconds = (int) Math.min(remaining, 14400); // max 4 hours
        }

        ActivityAttempt attempt = ActivityAttempt.builder()
            .user(user)
            .course(course)
            .activityType(ActivityType.OFFICIAL_EXAM)
            .simulado(simulado)
            .status("STARTED")
            .timeLimitSeconds(timeLimitSeconds)
            .totalQuestions(simulado.getQuestions().size())
            .weeklyCycleKey(weeklyKey)
            .build();

        // Snapshot all questions
        AtomicInteger order = new AtomicInteger(0);
        List<ActivityAttemptItemSnapshot> snapshots = simulado.getQuestions().stream()
            .map(q -> createSnapshot(attempt, q, order.getAndIncrement()))
            .toList();
        attempt.setSnapshots(new java.util.ArrayList<>(snapshots));

        return attemptRepository.save(attempt);
    }

    /**
     * Start a ModuleQuiz attempt.
     */
    @Transactional
    public ActivityAttempt startModuleQuiz(User user, Course course, Module module, int questionCount) {
        List<Question> questions = questionRepository.findRandomByModulesAndCategory(
            List.of(module.getId()), "QUIZ", questionCount
        );

        if (questions.isEmpty()) {
            questions = questionRepository.findRandomByModulesAndCategory(
                List.of(module.getId()), "SIMULADO", questionCount
            );
        }

        if (questions.isEmpty()) {
            throw new ResourceNotFoundException("Nenhuma questão disponível para este módulo.");
        }

        ActivityAttempt attempt = ActivityAttempt.builder()
            .user(user)
            .course(course)
            .activityType(ActivityType.MODULE_QUIZ)
            .module(module)
            .status("STARTED")
            .totalQuestions(questions.size())
            .build();

        AtomicInteger order = new AtomicInteger(0);
        List<ActivityAttemptItemSnapshot> snapshots = questions.stream()
            .map(q -> createSnapshot(attempt, q, order.getAndIncrement()))
            .toList();
        attempt.setSnapshots(new java.util.ArrayList<>(snapshots));

        return attemptRepository.save(attempt);
    }

    /**
     * Submit an answer for a specific question in an attempt.
     */
    @Transactional
    public ActivityAttemptItemSnapshot submitAnswer(UUID attemptId, UUID snapshotId, String selectedOption) {
        ActivityAttempt attempt = attemptRepository.findById(attemptId)
            .orElseThrow(() -> new ResourceNotFoundException("Tentativa não encontrada"));

        if ("COMPLETED".equals(attempt.getStatus()) || "EXPIRED".equals(attempt.getStatus())) {
            throw new IllegalStateException("Esta tentativa já foi finalizada.");
        }

        if (attempt.isTimedOut()) {
            attempt.setStatus("EXPIRED");
            attempt.setFinishedAt(OffsetDateTime.now());
            attempt.recalculateScore();
            attemptRepository.save(attempt);
            throw new IllegalStateException("Tempo esgotado.");
        }

        ActivityAttemptItemSnapshot snapshot = attempt.getSnapshots().stream()
            .filter(s -> s.getId().equals(snapshotId))
            .findFirst()
            .orElseThrow(() -> new ResourceNotFoundException("Questão não encontrada nesta tentativa."));

        if (snapshot.getStudentSelectedOption() != null) {
            throw new IllegalStateException("Questão já respondida.");
        }

        snapshot.setStudentSelectedOption(selectedOption);
        snapshot.evaluate();

        attempt.setStatus("IN_PROGRESS");
        attemptRepository.save(attempt);

        return snapshot;
    }

    /**
     * Finish an attempt (student submits or time runs out).
     */
    @Transactional
    public RewardDTO finishAttempt(UUID attemptId) {
        ActivityAttempt attempt = attemptRepository.findById(attemptId)
            .orElseThrow(() -> new ResourceNotFoundException("Tentativa não encontrada"));

        if ("COMPLETED".equals(attempt.getStatus())) {
            // Se já estiver completa, apenas retorna o estado atual (poderia recalcular se necessário)
            return gamificationService.addXp(attempt.getUser().getId(), 0);
        }

        attempt.complete();

        // Calculate XP
        int xp = calculateXp(attempt);
        attempt.setXpEarned(xp);

        ActivityAttempt saved = attemptRepository.save(attempt);

        // Publish event for async processing (analytics, ranking update, gamification)
        eventPublisher.publishEvent(new StudentAttemptCompletedEvent(saved));
        
        // Return Reward
        return gamificationService.addXp(attempt.getUser().getId(), xp);
    }

    /**
     * Get attempt with snapshots (for review / continue).
     */
    @Transactional(readOnly = true)
    public ActivityAttempt getAttempt(UUID attemptId) {
        ActivityAttempt attempt = attemptRepository.findById(attemptId)
            .orElseThrow(() -> new ResourceNotFoundException("Tentativa não encontrada"));
        attempt.getSnapshots().size(); // Force lazy load
        return attempt;
    }

    private ActivityAttemptItemSnapshot createSnapshot(ActivityAttempt attempt, Question q, int order) {
        return ActivityAttemptItemSnapshot.builder()
            .attempt(attempt)
            .originalQuestionId(q.getId())
            .questionOrder(order)
            .snapshotStatement(q.getStatement())
            .snapshotOptions(q.getOptions())
            .snapshotCorrectOption(q.getCorrectOption())
            .snapshotResolution(q.getResolution())
            .snapshotDifficulty(q.getDifficulty())
            .snapshotSubject(q.getSubject())
            .snapshotWeight(1.0)
            .build();
    }

    private int calculateXp(ActivityAttempt attempt) {
        int baseXp = switch (attempt.getActivityType()) {
            case OFFICIAL_EXAM -> 50;
            case MODULE_QUIZ -> 20;
        };
        double correctRatio = attempt.getTotalQuestions() > 0
            ? (double) attempt.getCorrectAnswers() / attempt.getTotalQuestions()
            : 0;
        return (int) (baseXp * (1 + correctRatio));
    }
}
