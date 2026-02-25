package com.bizu.portal.student.infrastructure;

import com.bizu.portal.student.domain.ActivityAttempt;
import com.bizu.portal.student.domain.ActivityType;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

public interface ActivityAttemptRepository extends JpaRepository<ActivityAttempt, UUID> {

    @Query("""
        SELECT a FROM ActivityAttempt a
        WHERE a.user.id = :userId
          AND a.course.id = :courseId
          AND a.activityType = :type
          AND a.status = 'COMPLETED'
        ORDER BY a.finishedAt DESC
        """)
    Page<ActivityAttempt> findCompletedByUserAndCourseAndType(
        @Param("userId") UUID userId,
        @Param("courseId") UUID courseId,
        @Param("type") ActivityType type,
        Pageable pageable
    );

    @Query("""
        SELECT a FROM ActivityAttempt a
        WHERE a.user.id = :userId
          AND a.simulado.id = :simuladoId
          AND a.status IN ('STARTED', 'IN_PROGRESS')
        ORDER BY a.startedAt DESC
        """)
    Optional<ActivityAttempt> findActiveAttemptForSimulado(
        @Param("userId") UUID userId,
        @Param("simuladoId") UUID simuladoId
    );

    @Query("""
        SELECT a FROM ActivityAttempt a
        WHERE a.user.id = :userId
          AND a.course.id = :courseId
          AND a.status = 'COMPLETED'
        ORDER BY a.finishedAt DESC
        """)
    List<ActivityAttempt> findCompletedByUserAndCourse(
        @Param("userId") UUID userId,
        @Param("courseId") UUID courseId
    );

    @Query("""
        SELECT COUNT(a) FROM ActivityAttempt a
        WHERE a.user.id = :userId
          AND a.course.id = :courseId
          AND a.activityType = :type
          AND a.status = 'COMPLETED'
        """)
    long countCompletedByUserAndCourseAndType(
        @Param("userId") UUID userId,
        @Param("courseId") UUID courseId,
        @Param("type") ActivityType type
    );

    @Query("""
        SELECT a FROM ActivityAttempt a
        WHERE a.weeklyCycleKey = :weeklyKey
          AND a.status = 'COMPLETED'
        ORDER BY a.scorePoints DESC
        """)
    List<ActivityAttempt> findByWeeklyCycleKey(@Param("weeklyKey") String weeklyKey);
}
