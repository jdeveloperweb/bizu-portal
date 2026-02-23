package com.bizu.portal.student.application;

import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;

import java.util.UUID;

@Service
@Slf4j
public class NotificationService {

    public void send(UUID userId, String title, String message) {
        log.info("Enviando notificação para o usuário {}: [{}] {}", userId, title, message);
        // Here we could persist in a Notification entity or send via WebSocket/Push
    }
}
