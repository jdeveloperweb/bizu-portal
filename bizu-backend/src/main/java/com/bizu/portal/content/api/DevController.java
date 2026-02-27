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
                        .title("Auto Generated Course")
                        .description("Curso criado para testes")
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
                    .title("Modulo Geral")
                    .course(course)
                    .orderIndex(1)
                    .build();
            module = moduleRepository.save(module);
        } else {
            module = course.getModules().get(0);
        }

        Random rand = new Random();
        String[] difficulties = {"EASY", "MEDIUM", "HARD"};
        String[] subjects = {"Direito Constitucional", "Português", "Matemática", "Informática", "Direito Penal"};

        for (int i = 0; i < count; i++) {
            Map<String, Object> options = new HashMap<>();
            options.put("0", "Opção A Correta - Q" + i);
            options.put("1", "Opção B - Q" + i);
            options.put("2", "Opção C - Q" + i);
            options.put("3", "Opção D - Q" + i);

            Question q = Question.builder()
                    .statement("<p>Questão de TESTE (QUIZ) #" + (i + 1) + "</p>")
                    .options(options)
                    .correctOption("A")
                    .difficulty(difficulties[rand.nextInt(3)])
                    .subject(subjects[rand.nextInt(subjects.length)])
                    .category("QUIZ") // ALTERADO PARA QUIZ
                    .questionType("MULTIPLE_CHOICE")
                    .module(module)
                    .build();
            
            questionRepository.save(q);
        }
        
        Map<String, Object> res = new HashMap<>();
        res.put("status", "success");
        res.put("created", count);
        return ResponseEntity.ok(res);
    }
}
