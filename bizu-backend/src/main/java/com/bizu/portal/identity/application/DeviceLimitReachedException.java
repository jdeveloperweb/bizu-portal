package com.bizu.portal.identity.application;

import lombok.Getter;

@Getter
public class DeviceLimitReachedException extends RuntimeException {
    private final String maskedEmail;
    private final String maskedPhone;

    public DeviceLimitReachedException(String maskedEmail, String maskedPhone) {
        super("Limite de dispositivos atingido.");
        this.maskedEmail = maskedEmail;
        this.maskedPhone = maskedPhone;
    }
}
