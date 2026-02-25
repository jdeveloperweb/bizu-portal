package com.bizu.portal.shared.security;

import java.lang.annotation.*;

/**
 * Annotation that enforces course-level entitlement on controller methods.
 * When applied, the filter will:
 * 1. Extract X-Selected-Course-Id header
 * 2. Validate that the authenticated user has an active entitlement for that course
 * 3. Return 403 if not entitled
 * 4. Populate CourseContextHolder for downstream use
 */
@Target({ElementType.METHOD, ElementType.TYPE})
@Retention(RetentionPolicy.RUNTIME)
@Documented
public @interface CourseContextGuard {
    /**
     * If true, only verifies that the header is present and valid UUID,
     * without checking entitlement (useful for public course previews).
     */
    boolean requireEntitlement() default true;
}
