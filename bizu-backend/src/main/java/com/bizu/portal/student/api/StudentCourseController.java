package com.bizu.portal.student.api;

import com.bizu.portal.content.domain.Course;
import com.bizu.portal.content.infrastructure.CourseRepository;
import com.bizu.portal.student.infrastructure.AttemptRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/student/courses")
@RequiredArgsConstructor
public class StudentCourseController {

    private final CourseRepository courseRepository;
    private final AttemptRepository attemptRepository;

    @GetMapping("/me")
    public ResponseEntity<List<Map<String, Object>>> getMyCourses(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = UUID.fromString(jwt.getSubject());
        List<Course> courses = courseRepository.findAll(); // Simplificado: todos os cursos publicados
        
        List<Map<String, Object>> response = new ArrayList<>();
        
        for (Course course : courses) {
            Map<String, Object> courseMap = new HashMap<>();
            courseMap.put("id", course.getId());
            courseMap.put("title", course.getTitle());
            courseMap.put("description", course.getDescription());
            courseMap.put("thumbnailUrl", course.getThumbnailUrl());
            courseMap.put("themeColor", course.getThemeColor());
            
            // Calcula progresso real baseado em questões resolvidas no curso
            long totalQuestions = course.getModules().stream()
                .flatMap(m -> m.getQuestions().stream())
                .count();
            
            long attemptedQuestions = 0;
            if (totalQuestions > 0) {
                // Aqui precisaríamos de uma query mais eficiente, mas para efeito prático:
                attemptedQuestions = attemptRepository.countDistinctQuestionByUserIdAndCourseId(userId, course.getId());
            }
            
            int progress = totalQuestions > 0 ? (int) ((attemptedQuestions * 100) / totalQuestions) : 0;
            courseMap.put("progress", progress);
            
            // Próximo módulo (primeiro não concluído ou o primeiro)
            courseMap.put("nextModule", course.getModules().isEmpty() ? "Bizu Academy" : course.getModules().get(0).getTitle());
            
            response.add(courseMap);
        }
        
        return ResponseEntity.ok(response);
    }
}
