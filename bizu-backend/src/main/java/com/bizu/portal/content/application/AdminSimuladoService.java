package com.bizu.portal.content.application;

import com.bizu.portal.content.domain.Course;
import com.bizu.portal.content.domain.Question;
import com.bizu.portal.content.domain.Simulado;
import com.bizu.portal.content.infrastructure.CourseRepository;
import com.bizu.portal.content.infrastructure.QuestionRepository;
import com.bizu.portal.content.infrastructure.SimuladoRepository;
import com.bizu.portal.shared.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.UUID;

@Service
@RequiredArgsConstructor
public class AdminSimuladoService {

    private final SimuladoRepository simuladoRepository;
    private final CourseRepository courseRepository;
    private final QuestionRepository questionRepository;

    public Page<Simulado> findAll(Pageable pageable) {
        return simuladoRepository.findAll(pageable);
    }

    public Simulado findById(UUID id) {
        return simuladoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Simulado not found"));
    }

    @Transactional
    public Simulado createSimulado(Simulado simulado, UUID courseId) {
        if (courseId != null) {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
            simulado.setCourse(course);
        }
        return simuladoRepository.save(simulado);
    }

    @Transactional
    public Simulado updateSimulado(UUID id, Simulado updateData, UUID courseId) {
        Simulado simulado = findById(id);
        simulado.setTitle(updateData.getTitle());
        simulado.setDescription(updateData.getDescription());
        simulado.setStartDate(updateData.getStartDate());
        simulado.setEndDate(updateData.getEndDate());
        simulado.setActive(updateData.isActive());
        
        if (courseId != null) {
            Course course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new ResourceNotFoundException("Course not found"));
            simulado.setCourse(course);
        } else {
            simulado.setCourse(null);
        }
        
        return simuladoRepository.save(simulado);
    }

    @Transactional
    public void deleteSimulado(UUID id) {
        simuladoRepository.deleteById(id);
    }

    @Transactional
    public Simulado addQuestion(UUID simuladoId, Question question) {
        Simulado simulado = findById(simuladoId);
        question.setCategory("SIMULADO");
        Question savedQuestion = questionRepository.save(question);
        
        simulado.getQuestions().add(savedQuestion);
        return simuladoRepository.save(simulado);
    }

    @Transactional
    public Simulado removeQuestion(UUID simuladoId, UUID questionId) {
        Simulado simulado = findById(simuladoId);
        simulado.getQuestions().removeIf(q -> q.getId().equals(questionId));
        return simuladoRepository.save(simulado);
    }
}
