package com.bizu.portal.student.api;

import com.bizu.portal.commerce.application.EntitlementService;
import com.bizu.portal.commerce.domain.CourseEntitlement;
import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.content.domain.Course;
import com.bizu.portal.content.infrastructure.CourseRepository;
import com.bizu.portal.student.infrastructure.AttemptRepository;
import com.bizu.portal.student.infrastructure.MaterialCompletionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import com.bizu.portal.identity.infrastructure.UserRepository;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/student/courses")
@RequiredArgsConstructor
public class StudentCourseController {

    private final CourseRepository courseRepository;
    private final AttemptRepository attemptRepository;
    private final EntitlementService entitlementService;
    private final UserService userService;
    private final UserRepository userRepository;
    private final MaterialCompletionRepository materialCompletionRepository;

    @PutMapping("/select")
    public ResponseEntity<?> updateSelectedCourse(@AuthenticationPrincipal Jwt jwt, @RequestBody Map<String, String> request) {
        UUID userId = userService.resolveUserId(jwt);
        String courseIdStr = request.get("courseId");

        if (courseIdStr == null) {
            return ResponseEntity.badRequest().build();
        }

        UUID courseId = UUID.fromString(courseIdStr);

        // Optional: Check if course exists
        if (!courseRepository.existsById(courseId)) {
            return ResponseEntity.badRequest().body("Curso não encontrado");
        }

        return userRepository.findById(userId)
            .map(user -> {
                Map<String, Object> metadata = user.getMetadata() != null
                    ? new HashMap<>(user.getMetadata())
                    : new HashMap<>();
                metadata.put("selectedCourseId", courseId.toString());
                user.setMetadata(metadata);
                userRepository.save(user);
                return ResponseEntity.ok().build();
            })
            .orElseGet(() -> ResponseEntity.notFound().build());
    }

    @GetMapping("/me")
    public ResponseEntity<List<Map<String, Object>>> getMyCourses(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = userService.resolveUserId(jwt);
        
        // Busca cursos que o usuário tem direito de acessar (assinatura, grupo, trial, etc)
        List<CourseEntitlement> activeEntitlements = entitlementService.getActiveEntitlements(userId);
        
        List<Course> entitledCourses = activeEntitlements.stream()
            .map(e -> e.getCourse())
            .filter(Objects::nonNull)
            .distinct()
            .collect(Collectors.toList());

        List<Course> courses = entitledCourses.stream()
            .map(course -> courseRepository.findByIdWithModules(course.getId()).orElse(course))
            .toList();
        
        List<Map<String, Object>> response = new ArrayList<>();
        
        for (Course course : courses) {
            Map<String, Object> courseMap = new HashMap<>();
            courseMap.put("id", course.getId());
            courseMap.put("title", course.getTitle());
            courseMap.put("description", course.getDescription());
            courseMap.put("thumbnailUrl", course.getThumbnailUrl());
            courseMap.put("themeColor", course.getThemeColor());
            courseMap.put("textColor", course.getTextColor());
            courseMap.put("category", course.getCategory());
            List<com.bizu.portal.content.domain.Module> modules =
                course.getModules() != null ? course.getModules() : Collections.emptyList();

            courseMap.put("modules", modules);
            
            Set<UUID> completedMaterialIds = materialCompletionRepository.findByUserId(userId).stream()
                .map(completion -> completion.getMaterial().getId())
                .collect(Collectors.toSet());

            Set<UUID> attemptedQuestionIds = attemptRepository.findDistinctQuestionIdsByUserIdAndCourseId(userId, course.getId());

            double totalWeight = 0D;
            double completedWeight = 0D;

            for (com.bizu.portal.content.domain.Module module : modules) {
                List<com.bizu.portal.content.domain.Material> moduleMaterials = module.getMaterials() != null
                    ? module.getMaterials()
                    : Collections.emptyList();
                List<com.bizu.portal.content.domain.Question> moduleQuestions = module.getQuestions() != null
                    ? module.getQuestions()
                    : Collections.emptyList();

                double moduleWeight = moduleMaterials.size() + (moduleQuestions.size() * 0.5D);

                if (moduleWeight <= 0D) {
                    continue;
                }

                totalWeight += moduleWeight;

                long completedMaterialsInModule = moduleMaterials.stream()
                    .filter(material -> completedMaterialIds.contains(material.getId()))
                    .count();

                long attemptedQuestionsInModule = moduleQuestions.stream()
                    .filter(question -> attemptedQuestionIds.contains(question.getId()))
                    .count();

                double moduleCompletedWeight = completedMaterialsInModule + (attemptedQuestionsInModule * 0.5D);
                double moduleProgress = Math.min(1D, moduleCompletedWeight / moduleWeight);

                completedWeight += moduleProgress * moduleWeight;
            }

            int progress = totalWeight > 0D
                ? (int) Math.round((completedWeight / totalWeight) * 100D)
                : 0;
            courseMap.put("progress", Math.max(0, Math.min(100, progress)));

            String nextModule = modules.stream()
                .filter(module -> {
                    List<com.bizu.portal.content.domain.Material> moduleMaterials = module.getMaterials() != null
                        ? module.getMaterials()
                        : Collections.emptyList();
                    List<com.bizu.portal.content.domain.Question> moduleQuestions = module.getQuestions() != null
                        ? module.getQuestions()
                        : Collections.emptyList();

                    if (moduleMaterials.isEmpty() && moduleQuestions.isEmpty()) {
                        return false;
                    }

                    boolean materialsDone = moduleMaterials.stream()
                        .allMatch(material -> completedMaterialIds.contains(material.getId()));
                    boolean questionsDone = moduleQuestions.stream()
                        .allMatch(question -> attemptedQuestionIds.contains(question.getId()));

                    return !(materialsDone && questionsDone);
                })
                .map(com.bizu.portal.content.domain.Module::getTitle)
                .findFirst()
                .orElse(modules.isEmpty() ? "Bizu Academy" : modules.get(0).getTitle());

            courseMap.put("nextModule", nextModule);
            
            // Contagem de alunos (simulada ou real se o repositório permitir)
            // Para ser preciso, deveríamos injetar o CourseEntitlementRepository e contar
            courseMap.put("studentsCount", 0); // Pode ser melhorado depois
            
            response.add(courseMap);
        }
        
        return ResponseEntity.ok(response);
    }
}
