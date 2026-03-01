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
        // ETAPA 1: Extração de Texto (OCR)
        String paperContent = essay.getContent();
        if (paperContent == null || paperContent.trim().isEmpty()) {
            if (essay.getAttachmentUrl() != null) {
                String ocrPrompt = "Aja como um motor de OCR de alta precisão. Transcreva o texto da imagem de redação abaixo. " +
                        "Retorne APENAS o texto transcrito, sem comentários, sem introduções e sem saudações. " +
                        "Mantenha as quebras de parágrafo originais.";
                paperContent = aiService.analyzeWithImage(ocrPrompt, essay.getAttachmentUrl());
                essay.setContent(paperContent);
                essayRepository.save(essay);
            }
        }

        if (paperContent == null || paperContent.trim().isEmpty()) {
            essay.setFeedback("Não foi possível extrair o texto para correção.");
            essay.setStatus("FAILED");
            essayRepository.save(essay);
            return;
        }

        // ETAPA 2: Análise Pedagógica (Markdown Puro)
        String analysisPrompt = "Você é um professor corretor de redações especialista no ENEM. " +
                "Sua tarefa é analisar o texto sobre o tema: \"" + essay.getTopic() + "\". " +
                "REGRAS CRÍTICAS: " +
                "1. Comece DIRETAMENTE com a análise. " +
                "2. NÃO diga 'Certamente', 'Aqui está' ou qualquer saudação. " +
                "3. Use Markdown para estrutura (Negrito, Listas). " +
                "4. NÃO inclua notas numéricas aqui. " +
                "5. NÃO inclua blocos de código JSON.";
        
        String feedbackMarkdown = aiService.analyze(analysisPrompt, paperContent);
        essay.setFeedback(feedbackMarkdown);

        // ETAPA 3: Métricas e Notas (JSON Puro)
        String metricsPrompt = "Você é um avaliador técnico do ENEM. " +
                "Gere as notas (0 a 200) para as 5 competências baseadas no texto e no tema: \"" + essay.getTopic() + "\". " +
                "SAÍDA OBRIGATÓRIA: Retorne APENAS o objeto JSON puro. " +
                "PROIBIDO: Não use blocos de código como ```json. Não escreva explicações. " +
                "FORMATO: {\"c1\": 160, \"c2\": 160, \"c3\": 160, \"c4\": 160, \"c5\": 160, \"total\": 800, \"improvement\": \"Dica curta de ouro\"}";
        
        String metricsJson = aiService.analyze(metricsPrompt, paperContent);
        parseAiMetrics(essay, metricsJson);

        essay.setStatus("CORRECTED");
        essayRepository.save(essay);
    }

    private void parseAiMetrics(Essay essay, String jsonResponse) {
        try {
            // Limpa qualquer lixo que a IA possa ter mandado além do JSON
            String cleanJson = jsonResponse.substring(jsonResponse.indexOf("{"), jsonResponse.lastIndexOf("}") + 1);
            JsonNode node = objectMapper.readTree(cleanJson);
            
            essay.setC1Score(node.path("c1").asInt());
            essay.setC2Score(node.path("c2").asInt());
            essay.setC3Score(node.path("c3").asInt());
            essay.setC4Score(node.path("c4").asInt());
            essay.setC5Score(node.path("c5").asInt());
            essay.setGrade(new BigDecimal(node.path("total").asInt()));
            essay.setImprovementHint(node.path("improvement").asText());
        } catch (Exception e) {
            System.err.println("Erro ao parsear métricas: " + e.getMessage());
            // Fallback para nota zero se o JSON falhar
            essay.setGrade(BigDecimal.ZERO);
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
