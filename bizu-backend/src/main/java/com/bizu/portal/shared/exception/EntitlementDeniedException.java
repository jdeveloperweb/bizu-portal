package com.bizu.portal.shared.exception;

public class EntitlementDeniedException extends RuntimeException {
    public EntitlementDeniedException(String message) {
        super(message);
    }
}
