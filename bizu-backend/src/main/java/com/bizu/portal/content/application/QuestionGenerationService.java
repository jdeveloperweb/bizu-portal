package com.bizu.portal.content.application;

import com.bizu.portal.ai.AiService;
import com.bizu.portal.content.domain.Question;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.ArrayList;
import java.util.List;
import java.util.UUID;

@Slf4j
@Service
@RequiredArgsConstructor
public class QuestionGenerationService {

    private final AiService aiService;
    private final QuestionSaveService questionSaveService;

    public void generate(
            String content,
            String materialTitle,
            UUID moduleId,
            String moduleName,
            int count,
            String category,
            SseEmitter emitter
    ) {
        try {
            List<String> chunks = splitContent(content);

            if (chunks.isEmpty()) {
                sendEvent(emitter, "error", "{\"message\":\"Conteúdo do artigo está vazio ou não pôde ser processado.\"}");
                emitter.complete();
                return;
            }

            // Only process as many chunks as needed — never more than the requested count
            int chunksNeeded = Math.min(chunks.size(), count);
            List<String> activeChunks = chunks.subList(0, chunksNeeded);

            int questionsPerChunk = count / chunksNeeded;
            int remainder = count % chunksNeeded;

            sendEvent(emitter, "start",
                    String.format("{\"totalChunks\":%d,\"targetQuestions\":%d,\"materialTitle\":\"%s\"}",
                            chunksNeeded, count, escapeJson(materialTitle)));

            int totalGenerated = 0;

            for (int i = 0; i < activeChunks.size(); i++) {
                int questionsForChunk = questionsPerChunk + (i < remainder ? 1 : 0);
                String chunk = activeChunks.get(i);

                String prompt = buildPrompt(moduleName, i + 1, chunksNeeded, category, questionsForChunk);
                String aiResponse = aiService.analyze(prompt, chunk);

                List<Question> saved = questionSaveService.parseAndSave(aiResponse, moduleId, category, moduleName);
                totalGenerated += saved.size();

                sendEvent(emitter, "progress",
                        String.format("{\"chunk\":%d,\"totalChunks\":%d,\"questionsGenerated\":%d}",
                                i + 1, chunksNeeded, totalGenerated));
            }

            sendEvent(emitter, "complete",
                    String.format("{\"totalGenerated\":%d,\"moduleId\":\"%s\"}", totalGenerated, moduleId));
            emitter.complete();

        } catch (Exception e) {
            log.error("Error during question generation for module {}", moduleId, e);
            try {
                sendEvent(emitter, "error",
                        String.format("{\"message\":\"Erro durante a geração: %s\"}", escapeJson(e.getMessage())));
                emitter.complete();
            } catch (Exception ex) {
                emitter.completeWithError(ex);
            }
        }
    }

    private void sendEvent(SseEmitter emitter, String eventName, String data) throws Exception {
        emitter.send(SseEmitter.event().name(eventName).data(data));
    }

    // ── Content Chunking ──────────────────────────────────────────────────────

    private List<String> splitContent(String content) {
        if (content == null || content.isBlank()) return List.of();

        // Strip HTML tags and normalize whitespace
        String plain = content
                .replaceAll("<[^>]+>", " ")
                .replaceAll("&[a-zA-Z0-9#]+;", " ")
                .replaceAll("\\s+", " ")
                .trim();

        if (plain.isBlank()) return List.of();
        if (plain.length() <= 4000) return List.of(plain);

        List<String> chunks = new ArrayList<>();
        int pos = 0;
        while (pos < plain.length()) {
            int end = Math.min(pos + 3500, plain.length());
            if (end < plain.length()) {
                // Split at last sentence boundary within the window
                int boundary = plain.lastIndexOf(". ", end);
                if (boundary > pos + 500) end = boundary + 2;
            }
            String chunk = plain.substring(pos, end).trim();
            if (!chunk.isEmpty()) chunks.add(chunk);
            pos = end;
        }
        return chunks;
    }

    // ── Prompt Builder ────────────────────────────────────────────────────────

    private String buildPrompt(String moduleName, int chunkNum, int totalChunks, String category, int count) {
        String typeInstruction = "SIMULADO".equals(category)
                ? "TIPO SIMULADO: Cada questão DEVE iniciar com uma narrativa situacional usando um personagem militar "
                  + "fictício (exemplos: 'O Soldado Carlos estava em patrulha quando...', "
                  + "'O Cabo Ferreira recebeu a ordem de...', 'O Sargento Lima precisou decidir...'). "
                  + "A narrativa deve contextualizar o cenário antes da pergunta direta."
                : "TIPO QUIZ: Questões diretas e objetivas, sem narrativa introdutória. "
                  + "Foque em recall e aplicação imediata do conteúdo.";

        return "Você é um especialista em elaboração de questões para treinamentos e concursos militares brasileiros.\n\n"
                + "CONTEXTO:\n"
                + "- Módulo: \"" + moduleName + "\"\n"
                + "- Trecho: " + chunkNum + " de " + totalChunks + "\n\n"
                + typeInstruction + "\n\n"
                + "DISTRIBUIÇÃO OBRIGATÓRIA DE DIFICULDADE:\n"
                + "- EASY (~30%): recall direto do texto\n"
                + "- MEDIUM (~50%): aplicação e compreensão do conteúdo\n"
                + "- HARD (~20%): análise, síntese ou situações excepcionais\n\n"
                + "REGRAS:\n"
                + "- Gere EXATAMENTE " + count + " questão(ões)\n"
                + "- 4 alternativas por questão: A, B, C, D\n"
                + "- Baseie-se EXCLUSIVAMENTE no conteúdo fornecido abaixo\n"
                + "- Responda SOMENTE em JSON válido, sem texto extra, sem blocos markdown\n\n"
                + "DEFINIÇÃO DOS CAMPOS:\n"
                + "- \"subject\": DISCIPLINA MILITAR ampla inferida do conteúdo. "
                + "Exemplos: \"Tática Militar\", \"Armamento\", \"Regulamentos\", \"Comunicações\", "
                + "\"Ordem Unida\", \"Topografia\", \"Legislação Militar\", \"Saúde Operacional\". "
                + "NÃO use o nome do módulo. Infira a disciplina a partir do assunto do texto.\n"
                + "- \"topic\": ASSUNTO ESPECÍFICO abordado nesta questão dentro do texto. "
                + "Exemplos: \"Posições de Tiro\", \"Técnicas de Envelopamento\", \"Uso do Rádio PRC-700\". "
                + "Deve ser preciso e diferente para cada questão.\n\n"
                + "FORMATO JSON OBRIGATÓRIO (siga exatamente esta estrutura):\n"
                + "{\"questions\":[{"
                + "\"statement\":\"texto do enunciado\","
                + "\"options\":{\"A\":\"...\",\"B\":\"...\",\"C\":\"...\",\"D\":\"...\"},"
                + "\"correctOption\":\"A\","
                + "\"resolution\":\"explicação detalhada da resposta correta\","
                + "\"difficulty\":\"EASY\","
                + "\"topic\":\"assunto específico desta questão (ex: Posições de Tiro)\","
                + "\"subject\":\"disciplina militar ampla (ex: Tática Militar)\""
                + "}]}\n\n"
                + "CONTEÚDO DO ARTIGO:";
    }

    private String escapeJson(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "");
    }
}
