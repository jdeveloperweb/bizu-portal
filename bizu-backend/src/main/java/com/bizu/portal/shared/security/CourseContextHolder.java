package com.bizu.portal.shared.security;

import java.util.UUID;

/**
 * Thread-local holder for the current course context.
 * Populated by CourseContextFilter after entitlement validation.
 * Available throughout the request lifecycle.
 */
public final class CourseContextHolder {

    private static final ThreadLocal<UUID> COURSE_ID = new ThreadLocal<>();
    private static final ThreadLocal<UUID> USER_ID = new ThreadLocal<>();

    private CourseContextHolder() {}

    public static void set(UUID courseId, UUID userId) {
        COURSE_ID.set(courseId);
        USER_ID.set(userId);
    }

    public static UUID getCourseId() {
        return COURSE_ID.get();
    }

    public static UUID getUserId() {
        return USER_ID.get();
    }

    public static UUID requireCourseId() {
        UUID id = COURSE_ID.get();
        if (id == null) {
            throw new IllegalStateException("Course context not set. Ensure @CourseContextGuard is applied.");
        }
        return id;
    }

    public static UUID requireUserId() {
        UUID id = USER_ID.get();
        if (id == null) {
            throw new IllegalStateException("User context not set.");
        }
        return id;
    }

    public static void clear() {
        COURSE_ID.remove();
        USER_ID.remove();
    }
}
