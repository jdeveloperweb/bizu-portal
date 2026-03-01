package com.bizu.portal.notification.application;

import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
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

    @Async("taskExecutor")
    public void sendMessage(String phoneNumber, String message) {
        log.info("[WHATSAPP] Processando envio para {}", phoneNumber);
        
        try {
            String endpoint = apiUrl + "/message/sendText/" + instanceName;
            log.info("[WHATSAPP] Enviando requisição para: {}", endpoint);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);
            headers.set("apikey", apiKey);
            
            // Format phone number
            String rawPhone = phoneNumber.replaceAll("\\D", "");
            if (rawPhone.length() == 10 || rawPhone.length() == 11) {
                rawPhone = "55" + rawPhone;
            }

            Map<String, Object> body = new HashMap<>();
            // Formato mais resiliente para Evolution API
            body.put("number", rawPhone);
            
            Map<String, String> textObj = new HashMap<>();
            textObj.put("text", message);
            body.put("textMessage", textObj);
            
            // Fallback para versões simples
            body.put("text", message);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            try {
                org.springframework.http.ResponseEntity<String> response = restTemplate.postForEntity(endpoint, request, String.class);
                log.info("[WHATSAPP] Resposta da Evolution API para {}: {} - {}", 
                    rawPhone, response.getStatusCode(), response.getBody());
            } catch (org.springframework.web.client.HttpClientErrorException e) {
                log.error("[WHATSAPP] Erro de cliente ({}): {}", e.getStatusCode(), e.getResponseBodyAsString());
            } catch (org.springframework.web.client.HttpServerErrorException e) {
                log.error("[WHATSAPP] Erro de servidor ({}): {}", e.getStatusCode(), e.getResponseBodyAsString());
            }
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

    public void sendPaymentPending(String phoneNumber, String name, String checkoutUrl) {
        String message = String.format(
            "Olá %s! 👋\n\n" +
            "Vimos que você iniciou o pagamento para o plano Premium da Axon Academy, mas ele ainda não foi concluído.\n\n" +
            "Para não perder seu acesso, você pode finalizar por aqui:\n" +
            "%s\n\n" +
            "Se precisar de ajuda, é só chamar!",
            name, checkoutUrl);
        
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
