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
            @RequestParam UUID courseId,
            @RequestParam(defaultValue = "50") int count) {
        
        Course course = courseRepository.findById(courseId)
                .orElseThrow(() -> new RuntimeException("Course not found"));

        if (course.getModules().isEmpty()) {
            Module defaultModule = Module.builder()
                    .title("Modulo Geral")
                    .description("Modulo criado automaticamente para testes")
                    .course(course)
                    .orderIndex(1)
                    .build();
            moduleRepository.save(defaultModule);
            course.getModules().add(defaultModule);
        }

        Random rand = new Random();
        int created = 0;
        String[] difficulties = {"EASY", "MEDIUM", "HARD"};

        for (int i = 0; i < count; i++) {
            Module module = course.getModules().get(rand.nextInt(course.getModules().size()));
            
            Map<String, Object> options = new HashMap<>();
            options.put("0", "Opção A para a questão " + i);
            options.put("1", "Opção B para a questão " + i);
            options.put("2", "Opção C para a questão " + i);
            options.put("3", "Opção D para a questão " + i);

            Question question = Question.builder()
                    .statement("<p>Questão de teste número " + (i + 1) + " para o módulo " + module.getTitle() + ".</p>")
                    .options(options)
                    .correctOption("A") // char index 0 is 'A'
                    .subject(module.getTitle())
                    .difficulty(difficulties[i % 3])
                    .category("SIMULADO")
                    .questionType("MULTIPLE_CHOICE")
                    .module(module)
                    .build();
            
            questionRepository.save(question);
            created++;
        }

        Map<String, Object> response = new HashMap<>();
        response.put("message", "Seed completed");
        response.put("created", created);
        response.put("course", course.getTitle());
        
        return ResponseEntity.ok(response);
    }
}
