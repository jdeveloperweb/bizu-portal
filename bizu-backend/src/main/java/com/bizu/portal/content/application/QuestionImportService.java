package com.bizu.portal.content.application;

import com.bizu.portal.content.domain.Question;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
@RequiredArgsConstructor
@Slf4j
public class QuestionImportService {

    private final QuestionService questionService;

    public int importFromCsv(MultipartFile file) {
        List<Question> questions = new ArrayList<>();
        int count = 0;

        try (BufferedReader reader = new BufferedReader(new InputStreamReader(file.getInputStream(), StandardCharsets.UTF_8))) {
            String line;
            boolean firstLine = true;
            
            while ((line = reader.readLine()) != null) {
                if (firstLine) { // Skip header
                    firstLine = false;
                    continue;
                }

                String[] data = line.split(";"); // Using semicolon as separator
                if (data.length < 8) continue;

                Map<String, Object> options = new HashMap<>();
                options.put("A", data[1].trim());
                options.put("B", data[2].trim());
                options.put("C", data[3].trim());
                options.put("D", data[4].trim());
                if (data.length > 8 && !data[8].isEmpty()) options.put("E", data[8].trim());

                Question question = Question.builder()
                        .statement(data[0].trim())
                        .options(options)
                        .correctOption(data[5].trim().toUpperCase())
                        .resolution(data[6].trim())
                        .banca(data[7].trim())
                        .year(Integer.parseInt(data[8].trim()))
                        .subject(data[9].trim())
                        .topic(data[10].trim())
                        .difficulty(data[11].trim().toUpperCase())
                        .questionType("MULTIPLE_CHOICE")
                        .build();

                questionService.save(question);
                count++;
            }
        } catch (Exception e) {
            log.error("Error importing questions from CSV", e);
            throw new RuntimeException("Falha ao importar questões: " + e.getMessage());
        }

        return count;
    }
}
