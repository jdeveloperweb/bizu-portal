package com.bizu.portal.commerce.infrastructure;

import com.bizu.portal.commerce.domain.CourseEntitlement;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface CourseEntitlementRepository extends JpaRepository<CourseEntitlement, UUID> {

    Optional<CourseEntitlement> findByUserIdAndCourseId(UUID userId, UUID courseId);

    @Query("""
        SELECT e FROM CourseEntitlement e
        WHERE e.user.id = :userId
          AND e.course.id = :courseId
          AND e.active = true
          AND (e.expiresAt IS NULL OR e.expiresAt > :now)
          AND e.revokedAt IS NULL
        """)
    Optional<CourseEntitlement> findActiveEntitlement(
        @Param("userId") UUID userId,
        @Param("courseId") UUID courseId,
        @Param("now") OffsetDateTime now
    );

    @Query("""
        SELECT e FROM CourseEntitlement e
        WHERE e.user.id = :userId
          AND e.active = true
          AND (e.expiresAt IS NULL OR e.expiresAt > :now)
          AND e.revokedAt IS NULL
        """)
    List<CourseEntitlement> findActiveEntitlementsByUser(
        @Param("userId") UUID userId,
        @Param("now") OffsetDateTime now
    );

    @Query("""
        SELECT CASE WHEN COUNT(e) > 0 THEN true ELSE false END
        FROM CourseEntitlement e
        WHERE e.user.id = :userId
          AND e.course.id = :courseId
          AND e.active = true
          AND (e.expiresAt IS NULL OR e.expiresAt > :now)
          AND e.revokedAt IS NULL
        """)
    boolean hasActiveEntitlement(
        @Param("userId") UUID userId,
        @Param("courseId") UUID courseId,
        @Param("now") OffsetDateTime now
    );

    List<CourseEntitlement> findBySourceIdAndSource(UUID sourceId, String source);

    @Query("""
        SELECT e FROM CourseEntitlement e
        WHERE e.active = true
          AND e.expiresAt IS NOT NULL
          AND e.expiresAt <= :cutoff
          AND e.revokedAt IS NULL
        """)
    List<CourseEntitlement> findExpiredEntitlements(@Param("cutoff") OffsetDateTime cutoff);

    @Query("""
        SELECT COUNT(e) FROM CourseEntitlement e
        WHERE e.course.id = :courseId
          AND e.active = true
          AND (e.expiresAt IS NULL OR e.expiresAt > :now)
          AND e.revokedAt IS NULL
        """)
    long countActiveEntitlementsByCourse(
        @Param("courseId") UUID courseId,
        @Param("now") OffsetDateTime now
    );
}
