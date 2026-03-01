package com.bizu.portal.admin.application;

import com.bizu.portal.content.infrastructure.*;
import com.bizu.portal.student.infrastructure.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AdminMaintenanceService {

    // Student Progress Repositories
    private final ActivityAttemptItemSnapshotRepository itemSnapshotRepository;
    private final ActivityAttemptRepository activityAttemptRepository;
    private final AttemptRepository attemptRepository;
    private final MaterialCompletionRepository materialCompletionRepository;
    private final NoteRepository noteRepository;
    private final FlashcardProgressRepository flashcardProgressRepository;
    private final SimulationRepository simulationRepository;
    private final SimuladoResultRepository simuladoResultRepository;
    private final EssayRepository essayRepository;
    private final DuelQuestionRepository duelQuestionRepository;
    private final DuelRepository duelRepository;

    // Content Repositories
    private final FlashcardRepository flashcardRepository;
    private final QuestionRepository questionRepository;
    private final MaterialRepository materialRepository;
    private final SimuladoRepository simuladoRepository;
    private final ModuleRepository moduleRepository;
    private final FlashcardDeckRepository flashcardDeckRepository;
    private final CourseRepository courseRepository;

    @Transactional
    public void resetPlatformContent() {
        log.warn("=== INICIANDO RESET DA PLATAFORMA (HARD DELETE) ===");

        // 1. Limpar histórico do aluno dependente do conteúdo
        log.info("Limpando progresso de alunos...");
        itemSnapshotRepository.deleteAll();
        activityAttemptRepository.deleteAll();
        attemptRepository.deleteAll();
        materialCompletionRepository.deleteAll();
        noteRepository.deleteAll();
        flashcardProgressRepository.deleteAll();
        simulationRepository.deleteAll();
        simuladoResultRepository.deleteAll();
        essayRepository.deleteAll();
        duelQuestionRepository.deleteAll();
        duelRepository.deleteAll();

        // 2. Limpar conteúdo
        log.info("Limpando conteúdo (Questões, Flashcards, Materiais, Simulados)...");
        flashcardRepository.deleteAll();
        questionRepository.deleteAll();
        materialRepository.deleteAll();
        simuladoRepository.deleteAll();
        flashcardDeckRepository.deleteAll();

        log.info("Limpando estrutura de Cursos e Módulos...");
        moduleRepository.deleteAll();
        courseRepository.deleteAll();

        log.warn("=== PLATAFORMA RESETADA COM SUCESSO ===");
    }
}
