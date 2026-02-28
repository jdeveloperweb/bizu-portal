package com.bizu.portal.notification.application;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.thymeleaf.TemplateEngine;
import org.thymeleaf.context.Context;

import java.util.Map;

@Slf4j
@Service
@RequiredArgsConstructor
public class EmailService {

    private final JavaMailSender javaMailSender;
    private final TemplateEngine templateEngine;

    @Value("${axon.mail.from-address}")
    private String fromAddress;

    @Value("${axon.mail.from-name}")
    private String fromName;

    @Async
    public void sendTemplatedEmail(String to, String subject, String templateName, Map<String, Object> variables) {
        log.info("Enviando e-mail para {} com assunto '{}' usando template '{}'", to, subject, templateName);
        
        try {
            Context context = new Context();
            context.setVariables(variables);
            
            String htmlContent = templateEngine.process("email/" + templateName, context);
            
            MimeMessage message = javaMailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");
            
            helper.setTo(to);
            helper.setFrom(fromAddress, fromName);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);
            
            javaMailSender.send(message);
            
            log.info("E-mail enviado com sucesso para {}", to);
        } catch (MessagingException | java.io.UnsupportedEncodingException e) {
            log.error("Erro ao enviar e-mail para {}: {}", to, e.getMessage(), e);
        } catch (Exception e) {
            log.error("Erro não esperado ao enviar e-mail para {}: {}", to, e.getMessage(), e);
        }
    }

    // Métodos utilitários baseados nos seus casos de uso
    
    public void sendVerificationCode(String to, String name, String code) {
        sendTemplatedEmail(to, "Seu código de verificação - Axon Academy", "verification-code", 
                Map.of("name", name, "code", code));
    }

    public void sendEmailChangeCode(String to, String name, String code) {
        sendTemplatedEmail(to, "Código para alteração de e-mail - Axon Academy", "email-change-verification", 
                Map.of("name", name, "code", code));
    }

    public void sendWelcomeEmail(String to, String name) {
        sendTemplatedEmail(to, "Bem-vindo(a) à Axon Academy! \uD83D\uDE80", "welcome-email", 
                Map.of("name", name));
    }

    public void sendPaymentSuccessEmail(String to, String name, String planName, String amount) {
        sendTemplatedEmail(to, "Seu pagamento foi confirmado! \uD83C\uDF89", "payment-success", 
                Map.of("name", name, "planName", planName, "amount", amount));
    }

    public void sendPaymentFailedEmail(String to, String name) {
        sendTemplatedEmail(to, "Atenção: Falha no pagamento da sua assinatura", "payment-failed", 
                Map.of("name", name));
    }
    
    public void sendSubscriptionRenewalReminder(String to, String name, String planName, String daysLeft) {
        sendTemplatedEmail(to, "Sua assinatura será renovada em breve", "subscription-renewal-reminder", 
                Map.of("name", name, "planName", planName, "daysLeft", daysLeft));
    }

    public void sendSubscriptionCanceled(String to, String name, String endDate) {
        sendTemplatedEmail(to, "Confirmação de cancelamento da assinatura", "subscription-canceled", 
                Map.of("name", name, "endDate", endDate));
    }
}
