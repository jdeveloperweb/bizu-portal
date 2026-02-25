package com.bizu.portal.shared.security;

import com.bizu.portal.commerce.application.EntitlementService;
import com.bizu.portal.shared.exception.CourseContextViolationException;
import com.bizu.portal.shared.exception.EntitlementDeniedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.aspectj.lang.ProceedingJoinPoint;
import org.aspectj.lang.annotation.Around;
import org.aspectj.lang.annotation.Aspect;
import org.springframework.stereotype.Component;

import java.util.UUID;

/**
 * AOP aspect that enforces @CourseContextGuard on annotated methods/classes.
 * Validates that:
 * 1. Course context header is present
 * 2. User has active entitlement for the course
 */
@Aspect
@Component
@RequiredArgsConstructor
@Slf4j
public class CourseContextAspect {

    private final EntitlementService entitlementService;

    @Around("@annotation(guard) || @within(guard)")
    public Object enforce(ProceedingJoinPoint joinPoint, CourseContextGuard guard) throws Throwable {
        UUID courseId = CourseContextHolder.getCourseId();
        UUID userId = CourseContextHolder.getUserId();

        if (courseId == null) {
            throw new CourseContextViolationException(
                "Header X-Selected-Course-Id é obrigatório para este endpoint."
            );
        }

        if (userId == null) {
            throw new CourseContextViolationException("Usuário não autenticado.");
        }

        if (guard.requireEntitlement()) {
            if (!entitlementService.hasAccess(userId, courseId)) {
                throw new EntitlementDeniedException(
                    "Você não possui acesso a este curso. Verifique sua assinatura."
                );
            }
        }

        return joinPoint.proceed();
    }
}
