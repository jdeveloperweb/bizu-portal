package com.bizu.portal.student.application;

import com.bizu.portal.ai.AiService;
import com.bizu.portal.content.domain.Course;
import com.bizu.portal.content.infrastructure.CourseRepository;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.UserRepository;
import com.bizu.portal.student.domain.Essay;
import com.bizu.portal.student.infrastructure.EssayRepository;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
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
    private final ObjectMapper objectMapper = new ObjectMapper();

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
                .topic(request.getTopic())
                .status("PENDING")
                .build();

        essay = essayRepository.save(essay);

        // Call AI for correction
        correctEssay(essay);

        return essay;
    }

    private void correctEssay(Essay essay) {
        String prompt = "Você é um professor avaliador rigoroso e justo de redações, especialista na correção do ENEM. " +
                "Analise a redação enviada e forneça um feedback detalhado ao aluno em Markdown. " +
                "O TEMA DA REDAÇÃO É: \"" + (essay.getTopic() != null ? essay.getTopic() : "Não especificado") + "\". " +
                "Siga rigorosamente as 5 competências do ENEM (0 a 200 pontos cada, totalizando de 0 a 1000). " +
                "C1: Domínio da norma culta; C2: Compreensão do tema; C3: Organização e interpretação; C4: Coesão; C5: Intervenção. " +
                "Analise cuidadosamente se o aluno abordou o tema proposto ou se houve fuga ao tema. " +
                "Ao final do feedback, inclua OBRIGATORIAMENTE um bloco JSON entre as tags [RESULTADO] e [/RESULTADO]. " +
                "IMPORTANTE: O JSON deve conter inteiros de 0 a 200 para competências e 0 a 1000 para o total. " +
                "Formato: {\"c1\": 160, \"c2\": 160, \"c3\": 140, \"c4\": 160, \"c5\": 140, \"total\": 760, \"improvement\": \"...\"}";

        String aiResponse;
        if (essay.getContent() != null && !essay.getContent().trim().isEmpty()) {
            aiResponse = aiService.analyze(prompt, essay.getContent());
        } else if (("IMAGE".equals(essay.getType()) || "PDF".equals(essay.getType())) && essay.getAttachmentUrl() != null) {
            aiResponse = aiService.analyzeWithImage(prompt, essay.getAttachmentUrl());
        } else {
            aiResponse = "Nenhum conteúdo enviado para correção.";
        }

        essay.setFeedback(aiResponse);
        parseAiResults(essay, aiResponse);
        essay.setStatus("CORRECTED");
        essayRepository.save(essay);
    }

    private void parseAiResults(Essay essay, String response) {
        try {
            Pattern pattern = Pattern.compile("\\[RESULTADO\\](.*?)\\[/RESULTADO\\]", Pattern.DOTALL | Pattern.CASE_INSENSITIVE);
            Matcher matcher = pattern.matcher(response);
            if (matcher.find()) {
                String jsonStr = matcher.group(1).trim();
                
                // Remover possíveis blocos de código markdown que a IA possa ter inserido
                jsonStr = jsonStr.replaceAll("```json", "").replaceAll("```", "").trim();
                
                JsonNode node = objectMapper.readTree(jsonStr);
                
                essay.setC1Score(node.path("c1").asInt());
                essay.setC2Score(node.path("c2").asInt());
                essay.setC3Score(node.path("c3").asInt());
                essay.setC4Score(node.path("c4").asInt());
                essay.setC5Score(node.path("c5").asInt());
                essay.setGrade(new BigDecimal(node.path("total").asInt()));
                essay.setImprovementHint(node.path("improvement").asText());
                
                // Remove o JSON do feedback final para o aluno não ver o "código"
                String cleanFeedback = response.replace(matcher.group(0), "").trim();
                essay.setFeedback(cleanFeedback);
            } else {
                essay.setGrade(extractGrade(response));
            }
        } catch (Exception e) {
            System.err.println("Erro ao parsear resultado da redação: " + e.getMessage());
            essay.setGrade(extractGrade(response));
        }
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
