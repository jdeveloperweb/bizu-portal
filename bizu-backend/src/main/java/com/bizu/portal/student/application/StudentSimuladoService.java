package com.bizu.portal.student.application;

import com.bizu.portal.content.domain.Question;
import com.bizu.portal.content.domain.Simulado;
import com.bizu.portal.content.infrastructure.QuestionRepository;
import com.bizu.portal.content.infrastructure.SimuladoRepository;
import com.bizu.portal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class StudentSimuladoService {

    private final SimuladoRepository simuladoRepository;
    private final QuestionRepository questionRepository;

    @Transactional(readOnly = true)
    public Simulado getSimuladoCompleto(UUID id) {
        Simulado simulado = simuladoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Simulado not found"));
        
        // This implicitly fetches the LAZY questions because of the @Transactional
        simulado.getQuestions().size(); 
        
        return simulado;
    }

    @Transactional(readOnly = true)
    public Simulado generateQuickQuiz(int count, List<UUID> moduleIds) {
        List<Question> questions;
        if (moduleIds != null && !moduleIds.isEmpty()) {
            questions = questionRepository.findRandomByModulesAndCategory(moduleIds, "QUIZ", count);
            if (questions.isEmpty()) {
                questions = questionRepository.findRandomByModulesAndCategory(moduleIds, "SIMULADO", count);
            }
        } else {
            questions = questionRepository.findRandomByCategory("QUIZ", count);
            if (questions.isEmpty()) {
                questions = questionRepository.findRandomByCategory("SIMULADO", count);
            }
        }

        Simulado quiz = new Simulado();
        quiz.setId(UUID.randomUUID());
        quiz.setTitle("Quick Quiz: Treino Rápido");
        quiz.setDescription("Quiz gerado automaticamente com " + count + " questões.");
        quiz.setQuestions(questions);
        quiz.setStartDate(OffsetDateTime.now());
        quiz.setEndDate(OffsetDateTime.now().plusMinutes((long) count * 3)); // 3 minutos por questão

        return quiz;
    }
}
