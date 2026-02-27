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
            courseMap.put("modules", modules.stream().map(module -> {
                Map<String, Object> moduleMap = new HashMap<>();
                moduleMap.put("id", module.getId());
                moduleMap.put("title", module.getTitle());
                moduleMap.put("description", module.getDescription());
                moduleMap.put("orderIndex", module.getOrderIndex());
                moduleMap.put("objectives", module.getObjectives());
                moduleMap.put("durationMinutes", module.getDurationMinutes());

                List<com.bizu.portal.content.domain.Material> moduleMaterials = module.getMaterials() != null
                    ? module.getMaterials()
                    : Collections.emptyList();
                List<com.bizu.portal.content.domain.Question> moduleQuestions = module.getQuestions() != null
                    ? module.getQuestions()
                    : Collections.emptyList();

                moduleMap.put("materials", moduleMaterials.stream().map(material -> {
                    Map<String, Object> materialMap = new HashMap<>();
                    materialMap.put("id", material.getId());
                    materialMap.put("title", material.getTitle());
                    materialMap.put("description", material.getDescription());
                    materialMap.put("fileUrl", material.getFileUrl());
                    materialMap.put("fileType", material.getFileType());
                    materialMap.put("isFree", material.isFree());
                    materialMap.put("durationMinutes", material.getDurationMinutes());
                    return materialMap;
                }).toList());

                moduleMap.put("questions", moduleQuestions.stream().map(question -> {
                    Map<String, Object> questionMap = new HashMap<>();
                    questionMap.put("id", question.getId());
                    questionMap.put("statement", question.getStatement());
                    questionMap.put("questionType", question.getQuestionType());
                    questionMap.put("difficulty", question.getDifficulty());
                    return questionMap;
                }).toList());

                return moduleMap;
            }).toList());
            
            Set<UUID> completedMaterialIds = materialCompletionRepository.findByUserId(userId).stream()
                .map(completion -> completion.getMaterial().getId())
                .collect(Collectors.toSet());

            double totalWeight = 0D;
            double completedWeight = 0D;

            for (com.bizu.portal.content.domain.Module module : modules) {
                List<com.bizu.portal.content.domain.Material> moduleMaterials = module.getMaterials() != null
                    ? module.getMaterials()
                    : Collections.emptyList();

                double moduleWeight = moduleMaterials.size();

                if (moduleWeight <= 0D) {
                    continue;
                }

                totalWeight += moduleWeight;

                long completedMaterialsInModule = moduleMaterials.stream()
                    .filter(material -> completedMaterialIds.contains(material.getId()))
                    .count();

                double moduleProgress = Math.min(1D, (double) completedMaterialsInModule / moduleWeight);

                completedWeight += moduleProgress * moduleWeight;
            }

            int progress = totalWeight > 0D
                ? (int) Math.round((completedWeight / totalWeight) * 100D)
                : 0;
            courseMap.put("progress", Math.max(0, Math.min(100, progress)));
            courseMap.put("durationMinutes", course.getDurationMinutes());

            com.bizu.portal.content.domain.Material nextMaterial = modules.stream()
                .flatMap(module -> (module.getMaterials() != null ? module.getMaterials() : Collections.<com.bizu.portal.content.domain.Material>emptyList()).stream())
                .filter(material -> !completedMaterialIds.contains(material.getId()))
                .findFirst()
                .orElse(null);

            String nextModule = "Concluído!";
            if (nextMaterial != null) {
                courseMap.put("nextMaterialId", nextMaterial.getId());
                // Encontrar o módulo do material para pegar o título
                nextModule = modules.stream()
                    .filter(m -> m.getMaterials() != null && m.getMaterials().contains(nextMaterial))
                    .map(com.bizu.portal.content.domain.Module::getTitle)
                    .findFirst()
                    .orElse("Próxima Aula");
            } else if (!modules.isEmpty()) {
                // Se tudo concluído, pode mostrar o primeiro módulo ou uma mensagem
                nextModule = "Curso Concluído! \uD83C\uDF89";
            }

            courseMap.put("nextModule", nextModule);
            
            // Contagem de alunos real via entitlementService
            courseMap.put("studentsCount", entitlementService.countStudentsByCourse(course.getId())); 
            
            response.add(courseMap);
        }
        
        return ResponseEntity.ok(response);
    }
}
