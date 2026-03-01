package com.bizu.portal.student.application;

import com.bizu.portal.content.domain.Course;
import com.bizu.portal.content.domain.Material;
import com.bizu.portal.content.infrastructure.CourseRepository;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.UserRepository;
import com.bizu.portal.notification.application.EmailService;
import com.bizu.portal.student.domain.MaterialCompletion;
import com.bizu.portal.student.infrastructure.MaterialCompletionRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.Set;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class CertificateService {

    private final MaterialCompletionRepository completionRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final EmailService emailService;

    @Async("taskExecutor")
    @Transactional
    public void checkAndIssueCertificate(UUID userId, UUID materialId) {
        log.info("Verificando se material {} concluiu um curso para o usuário {}", materialId, userId);
        
        try {
            User user = userRepository.findById(userId)
                    .orElseThrow(() -> new IllegalArgumentException("Usuário não encontrado: " + userId));

            // 1. Descobrir a qual curso esse material pertence
            List<Course> allCourses = courseRepository.findAll();
            Course currentCourse = null;
            
            for (Course course : allCourses) {
                if (course.getModules() != null) {
                    boolean found = course.getModules().stream()
                        .filter(m -> m.getMaterials() != null)
                        .flatMap(m -> m.getMaterials().stream())
                        .anyMatch(mat -> mat.getId().equals(materialId));
                        
                    if (found) {
                        currentCourse = course;
                        break;
                    }
                }
            }
            
            if (currentCourse == null) {
                log.warn("Material {} não pertence a nenhum curso, ou curso não possui módulos na busca. Ignorando certificado.", materialId);
                return;
            }

            // 2. Levantar todos os materiais deste curso
            List<Material> courseMaterials = currentCourse.getModules().stream()
                .filter(m -> m.getMaterials() != null)
                .flatMap(m -> m.getMaterials().stream())
                .collect(Collectors.toList());
                
            if (courseMaterials.isEmpty()) {
                return;
            }

            // 3. Pegar progresso do aluno
            Set<UUID> completedMaterialIds = completionRepository.findByUserId(userId).stream()
                .map(MaterialCompletion::getMaterial)
                .map(Material::getId)
                .collect(Collectors.toSet());

            // 4. Checar se ele fez todos
            long completedCount = courseMaterials.stream()
                .filter(mat -> completedMaterialIds.contains(mat.getId()))
                .count();

            // Se atingir 100% dos materiais
            if (completedCount == courseMaterials.size()) {
                log.info("Parabéns! Usuário {} concluiu 100% do curso {}. Emitindo certificado...", user.getEmail(), currentCourse.getTitle());
                issueCertificate(user, currentCourse);
            } else {
                log.debug("Progresso: {}/{} do curso {}", completedCount, courseMaterials.size(), currentCourse.getTitle());
            }

        } catch (Exception e) {
            log.error("Erro ao verificar/emitir certificado para usuário {} e material {}: {}", userId, materialId, e.getMessage());
        }
    }

    private void issueCertificate(User user, Course course) {
        try {
            // Emissão de E-mail de Conclusão / Certificado
            // Em uma V2 aqui poderia gerar um arquivo PDF real e enviar como anexo ou URL do S3.
            
            emailService.sendTemplatedEmail(
                user.getEmail(),
                "Certificado de Conclusão - " + course.getTitle() + " \uD83C\uDF93",
                "course-certificate", // Assumindo que este template será injetado ou já exista (podemos usar fallback se não)
                Map.of(
                    "name", user.getName(),
                    "courseName", course.getTitle(),
                    "duration", course.getDurationMinutes() > 0 ? (course.getDurationMinutes() / 60) + " horas" : "Tempo indeterminado"
                )
            );
            
            // Registra um log de auditoria permanente (opcional: criar entidade e respostory 'Certificate')
            log.warn("CERTIFICADO ENVIADO: Curso [{}] - Aluno: {} ({})", course.getTitle(), user.getName(), user.getEmail());
            
        } catch (Exception e) {
            log.error("Falha ao enviar e-mail de certificado: {}", e.getMessage());
        }
    }
}
