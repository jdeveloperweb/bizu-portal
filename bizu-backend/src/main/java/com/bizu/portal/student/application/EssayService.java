package com.bizu.portal.student.application;

import com.bizu.portal.ai.AiService;
import com.bizu.portal.content.domain.Course;
import com.bizu.portal.content.infrastructure.CourseRepository;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.UserRepository;
import com.bizu.portal.student.domain.Essay;
import com.bizu.portal.student.infrastructure.EssayRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.UUID;
import java.util.regex.Matcher;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class EssayService {

    private final EssayRepository essayRepository;
    private final CourseRepository courseRepository;
    private final UserRepository userRepository;
    private final AiService aiService;

    public List<Essay> getStudentEssays(UUID studentId, UUID courseId) {
        if (courseId != null) {
            return essayRepository.findByStudentIdAndCourseId(studentId, courseId);
        }
        return essayRepository.findByStudentId(studentId);
    }

    @Transactional
    public Essay submitEssay(UUID studentId, SubmitEssayRequest request) {
        User student = userRepository.findById(studentId).orElseThrow(() -> new RuntimeException("Student not found"));
        Course course = courseRepository.findById(request.getCourseId()).orElseThrow(() -> new RuntimeException("Course not found"));

        if (!course.isHasEssay()) {
            throw new RuntimeException("This course does not have essay feature enabled");
        }

        Essay essay = Essay.builder()
                .student(student)
                .course(course)
                .title(request.getTitle())
                .content(request.getContent())
                .attachmentUrl(request.getAttachmentUrl())
                .type(request.getType())
                .status("PENDING")
                .build();

        essay = essayRepository.save(essay);

        // Call AI for correction
        correctEssay(essay);

        return essay;
    }

    private void correctEssay(Essay essay) {
        String prompt = "Você é um professor avaliador rigoroso e justo de redações. " +
                "Analise a redação enviada, corrija erros gramaticais, de coesão, coerência e estrutura. " +
                "Ao final, dê uma nota de 0 a 10 com duas casas decimais. " +
                "Formate seu feedback de forma clara para o aluno usando markdown. " +
                "No final de tudo, inclua obrigatoriamente a tag [NOTA: X.XX] onde X.XX é a nota.";

        String aiResponse;
        if (essay.getContent() != null && !essay.getContent().trim().isEmpty()) {
            aiResponse = aiService.analyze(prompt, essay.getContent());
        } else if (("IMAGE".equals(essay.getType()) || "PDF".equals(essay.getType())) && essay.getAttachmentUrl() != null) {
            aiResponse = aiService.analyzeWithImage(prompt, essay.getAttachmentUrl());
        } else {
            aiResponse = "Nenhum conteúdo enviado para correção.";
        }

        essay.setFeedback(aiResponse);
        essay.setGrade(extractGrade(aiResponse));
        essay.setStatus("CORRECTED");
        essayRepository.save(essay);
    }

    private BigDecimal extractGrade(String feedback) {
        try {
            Pattern pattern = Pattern.compile("\\[NOTA:\\s*(\\d+[.,]\\d+)\\]");
            Matcher matcher = pattern.matcher(feedback);
            if (matcher.find()) {
                String gradeStr = matcher.group(1).replace(",", ".");
                return new BigDecimal(gradeStr);
            }
        } catch (Exception e) {
            // handle extraction error
        }
        return BigDecimal.ZERO;
    }

    @Transactional
    public void deleteEssay(UUID studentId, UUID essayId) {
        Essay essay = essayRepository.findById(essayId)
                .orElseThrow(() -> new RuntimeException("Essay not found"));

        if (!essay.getStudent().getId().equals(studentId)) {
            throw new RuntimeException("You can only delete your own essays");
        }

        essayRepository.delete(essay);
    }

    public String extractText(String imageUrl) {
        return aiService.extractTextFromImage(imageUrl);
    }
}
