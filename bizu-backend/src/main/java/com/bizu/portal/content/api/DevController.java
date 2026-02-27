package com.bizu.portal.content.api;

import com.bizu.portal.content.domain.Course;
import com.bizu.portal.content.domain.Module;
import com.bizu.portal.content.domain.Question;
import com.bizu.portal.content.infrastructure.CourseRepository;
import com.bizu.portal.content.infrastructure.ModuleRepository;
import com.bizu.portal.content.infrastructure.QuestionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;
import java.util.Random;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/public/dev")
@RequiredArgsConstructor
public class DevController {

    private final CourseRepository courseRepository;
    private final ModuleRepository moduleRepository;
    private final QuestionRepository questionRepository;

    @PostMapping("/seed-questions")
    @Transactional
    public ResponseEntity<Map<String, Object>> seedQuestions(
            @RequestParam(required = false) UUID courseId,
            @RequestParam(defaultValue = "100") int count) {
        
        Course course;
        if (courseId == null) {
            course = courseRepository.findAll().stream().findFirst().orElseGet(() -> {
                Course c = Course.builder()
                        .title("Curso de Testes Arena")
                        .description("Criado automaticamente")
                        .status("PUBLISHED")
                        .build();
                return courseRepository.save(c);
            });
        } else {
            course = courseRepository.findById(courseId)
                    .orElseThrow(() -> new RuntimeException("Course not found"));
        }

        Module module;
        if (course.getModules() == null || course.getModules().isEmpty()) {
            module = Module.builder()
                    .title("Módulo Geral")
                    .course(course)
                    .orderIndex(1)
                    .build();
            module = moduleRepository.save(module);
        } else {
            module = course.getModules().get(0);
        }

        Random rand = new Random();
        String[] difficulties = {"EASY", "MEDIUM", "HARD"};
        String[] subjects = {"Direito Constitucional", "Português", "Matemática", "Informática", "Direito Penal", "Aleatorio"};

        for (int i = 0; i < count; i++) {
            Map<String, Object> options = new HashMap<>();
            options.put("0", "Opção A (Correta) - Questão " + i);
            options.put("1", "Opção B - Questão " + i);
            options.put("2", "Opção C - Questão " + i);
            options.put("3", "Opção D - Questão " + i);

            Question q = Question.builder()
                    .statement("<p>Questão simulada " + (i + 1) + ". Esta é uma questão gerada automaticamente para testes da Arena PVP.</p>")
                    .options(options)
                    .correctOption("A")
                    .difficulty(difficulties[rand.nextInt(3)])
                    .subject(subjects[rand.nextInt(subjects.length)])
                    .category("SIMULADO")
                    .questionType("MULTIPLE_CHOICE")
                    .module(module)
                    .build();
            
            questionRepository.save(q);
        }

        Map<String, Object> res = new HashMap<>();
        res.put("message", "Seed completed successfully");
        res.put("created", count);
        res.put("target_course", course.getTitle());
        
        return ResponseEntity.ok(res);
    }
}
