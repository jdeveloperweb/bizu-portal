package com.bizu.portal.notification.application;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

/**
 * Serviço para integração com WhatsApp usando Evolution API.
 */
@Slf4j
@Service
public class WhatsAppService {

    private final RestTemplate restTemplate = new RestTemplate();

    @Value("${axon.whatsapp.evolution.url:http://localhost:8099}")
    private String apiUrl;

    @Value("${axon.whatsapp.evolution.api-key:BizuAxonAcademy@2024}")
    private String apiKey;

    @Value("${axon.whatsapp.evolution.instance:AxonBot}")
    private String instanceName;

    @Async
    public void sendMessage(String phoneNumber, String message) {
        log.info("[WHATSAPP] Processando envio para {}", phoneNumber);
        
        try {
            String endpoint = apiUrl + "/message/sendText/" + instanceName;

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("apikey", apiKey);
            
            // Format phone number
            String rawPhone = phoneNumber.replaceAll("\\D", "");
            if (rawPhone.length() == 10 || rawPhone.length() == 11) {
                rawPhone = "55" + rawPhone;
            }

            Map<String, Object> textMessage = new HashMap<>();
            textMessage.put("text", message);

            Map<String, Object> body = new HashMap<>();
            body.put("number", rawPhone);
            body.put("textMessage", textMessage);
            
            Map<String, Object> options = new HashMap<>();
            options.put("delay", 1500);
            options.put("presence", "composing");
            body.put("options", options);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            restTemplate.postForObject(endpoint, request, Map.class);
            log.info("[WHATSAPP] Mensagem enviada para {} com sucesso", rawPhone);
        } catch (Exception e) {
            log.error("[WHATSAPP] Falha ao enviar para {}: {}", phoneNumber, e.getMessage());
        }
    }

    public void sendVerificationCode(String phoneNumber, String name, String code) {
        String message = String.format(
            "Olá %s! 👋\n\n" +
            "Seu código de verificação da *Axon Academy* é:\n\n" +
            "*%s*\n\n" +
            "Este código é válido por 15 minutos.\n" +
            "Se você não solicitou este código, ignore esta mensagem.", 
            name, code);
        
        sendMessage(phoneNumber, message);
    }
    
    public void sendAbandonedCheckoutReminder(String phoneNumber, String name) {
        String message = String.format(
            "Oi %s, vimos que você começou seu cadastro na Axon Academy mas não finalizou. 😔\n\n" +
            "Ficou alguma dúvida sobre o plano Premium? Se precisar de ajuda, pode nos responder por aqui mesmo!",
            name);
            
        sendMessage(phoneNumber, message);
    }

    public void sendPixGenerated(String phoneNumber, String name, String pixCode) {
        String message = String.format(
            "Olá %s! 🎉\n\n" +
            "Seu Pix para o plano Premium da Axon Academy foi gerado com sucesso.\n\n" +
            "Copie o código abaixo e cole no seu banco (Copia e Cola):\n\n" +
            "%s\n\n" +
            "⚠️ Ele vence em 1 hora.",
            name, pixCode);
            
        sendMessage(phoneNumber, message);
    }

    public void sendPaymentSuccess(String phoneNumber, String name) {
        String message = String.format(
            "Uhuuul! %s, seu pagamento foi aprovado! 🚀\n\n" +
            "Seu acesso Premium à Axon Academy já está liberado. Bora estudar e conquistar essa aprovação!",
            name);
            
        sendMessage(phoneNumber, message);
    }
}
