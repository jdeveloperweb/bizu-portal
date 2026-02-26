package com.bizu.portal.ai;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;
import org.springframework.http.*;
import java.util.*;

@Service
public class AiService {

    @Value("${AI_API_KEY:}")
    private String apiKey;

    private final String apiUrl = "https://api.openai.com/v1/chat/completions";

    private final RestTemplate restTemplate = new RestTemplate();

    public String analyze(String prompt, String content) {
        if (apiKey == null || apiKey.isEmpty()) {
            return "AI API Key not configured. Please configure app.ai.api-key.";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> request = new HashMap<>();
        request.put("model", "gpt-4o"); // Using a robust model by default
        
        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content", prompt));
        messages.add(Map.of("role", "user", "content", content));
        
        request.put("messages", messages);
        request.put("temperature", 0.3);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, new HttpEntity<>(request, headers), Map.class);
            if (response.getStatusCode() == HttpStatus.OK) {
                Map body = response.getBody();
                if (body != null && body.containsKey("choices")) {
                    List choices = (List) body.get("choices");
                    if (!choices.isEmpty()) {
                        Map firstChoice = (Map) choices.get(0);
                        Map message = (Map) firstChoice.get("message");
                        return (String) message.get("content");
                    }
                }
            }
            return "Error calling AI API: " + response.getStatusCode();
        } catch (Exception e) {
            return "Exception calling AI API: " + e.getMessage();
        }
    }

    public String analyzeWithImage(String prompt, String imageUrl) {
         if (apiKey == null || apiKey.isEmpty()) {
            return "AI API Key not configured.";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> request = new HashMap<>();
        request.put("model", "gpt-4o");
        
        List<Map<String, Object>> messages = new ArrayList<>();
        
        Map<String, Object> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", prompt);
        messages.add(systemMessage);

        Map<String, Object> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        
        List<Map<String, Object>> userContent = new ArrayList<>();
        userContent.add(Map.of("type", "text", "text", "Please analyze this essay image and extract the text first, then provide feedback and a grade."));
        userContent.add(Map.of("type", "image_url", "image_url", Map.of("url", imageUrl)));
        
        userMessage.put("content", userContent);
        messages.add(userMessage);
        
        request.put("messages", messages);

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, new HttpEntity<>(request, headers), Map.class);
             if (response.getStatusCode() == HttpStatus.OK) {
                Map body = response.getBody();
                if (body != null && body.containsKey("choices")) {
                    List choices = (List) body.get("choices");
                    if (!choices.isEmpty()) {
                        Map firstChoice = (Map) choices.get(0);
                        Map message = (Map) firstChoice.get("message");
                        return (String) message.get("content");
                    }
                }
            }
            return "Error calling AI API: " + response.getStatusCode();
        } catch (Exception e) {
             return "Exception calling AI API: " + e.getMessage();
        }
    public String extractTextFromImage(String imageUrl) {
         if (apiKey == null || apiKey.isEmpty()) {
            return "AI API Key not configured.";
        }

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(apiKey);

        Map<String, Object> request = new HashMap<>();
        request.put("model", "gpt-4o");
        
        List<Map<String, Object>> messages = new ArrayList<>();
        
        Map<String, Object> systemMessage = new HashMap<>();
        systemMessage.put("role", "system");
        systemMessage.put("content", "Você é um especialista em OCR. Sua única tarefa é extrair TODO o texto da imagem da redação fornecida. " +
                "Não adicione comentários, não corrija o texto, não dê notas. Apenas o texto puro exatamente como escrito na imagem.");
        messages.add(systemMessage);

        Map<String, Object> userMessage = new HashMap<>();
        userMessage.put("role", "user");
        
        List<Map<String, Object>> userContent = new ArrayList<>();
        userContent.add(Map.of("type", "image_url", "image_url", Map.of("url", imageUrl)));
        
        userMessage.put("content", userContent);
        messages.add(userMessage);
        
        request.put("messages", messages);
        request.put("temperature", 0.0); // Predictable extraction

        try {
            ResponseEntity<Map> response = restTemplate.postForEntity(apiUrl, new HttpEntity<>(request, headers), Map.class);
             if (response.getStatusCode() == HttpStatus.OK) {
                Map body = response.getBody();
                if (body != null && body.containsKey("choices")) {
                    List choices = (List) body.get("choices");
                    if (!choices.isEmpty()) {
                        Map firstChoice = (Map) choices.get(0);
                        Map message = (Map) firstChoice.get("message");
                        return (String) message.get("content");
                    }
                }
            }
            return "Error calling AI API: " + response.getStatusCode();
        } catch (Exception e) {
             return "Exception calling AI API: " + e.getMessage();
        }
    }
}
