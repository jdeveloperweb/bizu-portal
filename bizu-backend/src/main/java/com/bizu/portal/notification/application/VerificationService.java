package com.bizu.portal.notification.application;

import com.bizu.portal.identity.domain.VerificationCode;
import com.bizu.portal.identity.infrastructure.VerificationCodeRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Random;

@Service
@RequiredArgsConstructor
@Slf4j
public class VerificationService {

    private final VerificationCodeRepository verificationCodeRepository;
    private final EmailService emailService;
    private final WhatsAppService whatsAppService;
    private final Random random = new Random();

    @Transactional
    public void generateAndSendCode(String recipient, String name, String type) {
        // Gerar um código de 6 dígitos aleatórios
        String code = String.format("%06d", random.nextInt(1000000));
        
        // Expirar em 15 minutos
        LocalDateTime expiresAt = LocalDateTime.now().plusMinutes(15);
        
        VerificationCode verificationCode = VerificationCode.builder()
                .recipient(recipient)
                .code(code)
                .type(type)
                .expiresAt(expiresAt)
                .used(false)
                .build();
                
        verificationCodeRepository.save(verificationCode);
        
        log.info("Código gerado para {} via {}: {}", recipient, type, code);

        // Disparar o envio real
        if ("EMAIL".equalsIgnoreCase(type)) {
            emailService.sendVerificationCode(recipient, name, code);
        } else if ("EMAIL_CHANGE".equalsIgnoreCase(type)) {
            emailService.sendEmailChangeCode(recipient, name, code);
        } else if ("WHATSAPP".equalsIgnoreCase(type) || "PHONE_CHANGE".equalsIgnoreCase(type)) {
            whatsAppService.sendVerificationCode(recipient, name, code);
        }
    }

    @Transactional
    public boolean validateCode(String recipient, String type, String inputCode) {
        log.info("Validando código para {} ({}): {}", recipient, type, inputCode);
        
        Optional<VerificationCode> codeOpt = verificationCodeRepository
            .findTopByRecipientAndTypeAndUsedFalseOrderByCreatedAtDesc(recipient, type);
            
        if (codeOpt.isPresent()) {
            VerificationCode foundCode = codeOpt.get();
            
            if (foundCode.isValid() && foundCode.getCode().equals(inputCode)) {
                foundCode.setUsed(true);
                verificationCodeRepository.save(foundCode);
                
                log.info("Código validado com sucesso para {}", recipient);
                return true;
            } else if (!foundCode.isValid()) {
                log.warn("Código expirado tentar validar para {}", recipient);
            } else {
                log.warn("Código inválido tentar validar para {}", recipient);
            }
        } else {
            log.warn("Nenhum código encontrado ou já utilizado para {}", recipient);
        }
        
        return false;
    }
}
