package com.bizu.portal.shared.exception;

import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.time.OffsetDateTime;
import java.util.LinkedHashMap;
import java.util.Map;

@RestControllerAdvice
@Slf4j
public class GlobalExceptionHandler {

    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<Map<String, Object>> handleNotFound(ResourceNotFoundException ex) {
        return createErrorResponse(ex.getMessage(), HttpStatus.NOT_FOUND, "RESOURCE_NOT_FOUND");
    }

    @ExceptionHandler(EntitlementDeniedException.class)
    public ResponseEntity<Map<String, Object>> handleEntitlementDenied(EntitlementDeniedException ex) {
        return createErrorResponse(ex.getMessage(), HttpStatus.FORBIDDEN, "ENTITLEMENT_DENIED");
    }

    @ExceptionHandler(CourseContextViolationException.class)
    public ResponseEntity<Map<String, Object>> handleCourseContextViolation(CourseContextViolationException ex) {
        return createErrorResponse(ex.getMessage(), HttpStatus.BAD_REQUEST, "COURSE_CONTEXT_MISSING");
    }

    @ExceptionHandler(IllegalStateException.class)
    public ResponseEntity<Map<String, Object>> handleIllegalState(IllegalStateException ex) {
        return createErrorResponse(ex.getMessage(), HttpStatus.CONFLICT, "INVALID_STATE");
    }

    @ExceptionHandler(Exception.class)
    public ResponseEntity<Map<String, Object>> handleGeneral(Exception ex) {
        log.error("Unhandled exception", ex);
        return createErrorResponse("Erro interno no servidor", HttpStatus.INTERNAL_SERVER_ERROR, "INTERNAL_ERROR");
    }

    private ResponseEntity<Map<String, Object>> createErrorResponse(String message, HttpStatus status, String code) {
        Map<String, Object> body = new LinkedHashMap<>();
        body.put("timestamp", OffsetDateTime.now());
        body.put("status", status.value());
        body.put("error", status.getReasonPhrase());
        body.put("code", code);
        body.put("message", message);
        return new ResponseEntity<>(body, status);
    }
}
