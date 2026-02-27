package com.bizu.portal.commerce.application;

import com.bizu.portal.commerce.domain.CourseEntitlement;
import com.bizu.portal.commerce.domain.Subscription;
import com.bizu.portal.commerce.domain.SubscriptionGroup;
import com.bizu.portal.commerce.infrastructure.CourseEntitlementRepository;
import com.bizu.portal.content.domain.Course;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.shared.exception.EntitlementDeniedException;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
@Slf4j
public class EntitlementService {

    private final CourseEntitlementRepository entitlementRepository;

    /**
     * Core check: does this user have active access to this course right now?
     */
    public boolean hasAccess(UUID userId, UUID courseId) {
        return entitlementRepository.hasActiveEntitlement(userId, courseId, OffsetDateTime.now());
    }

    /**
     * Enforce access — throws 403 if no valid entitlement.
     */
    public void enforceAccess(UUID userId, UUID courseId) {
        if (!hasAccess(userId, courseId)) {
            throw new EntitlementDeniedException(
                "Acesso negado ao curso. Verifique sua assinatura."
            );
        }
    }

    /**
     * Returns all courses the user currently has access to.
     */
    public List<CourseEntitlement> getActiveEntitlements(UUID userId) {
        return entitlementRepository.findActiveEntitlementsByUser(userId, OffsetDateTime.now());
    }

    /**
     * Returns the number of students with active access to a course.
     */
    public long countStudentsByCourse(UUID courseId) {
        return entitlementRepository.countActiveEntitlementsByCourse(courseId, OffsetDateTime.now());
    }

    /**
     * Grant entitlement from a subscription.
     */
    @Transactional
    public CourseEntitlement grantFromSubscription(User user, Course course, Subscription subscription) {
        return grantEntitlement(user, course, "SUBSCRIPTION",
            subscription.getId(), subscription.getCurrentPeriodEnd());
    }

    /**
     * Grant entitlement from a group seat.
     */
    @Transactional
    public CourseEntitlement grantFromGroup(User user, Course course, SubscriptionGroup group) {
        return grantEntitlement(user, course, "GROUP_SEAT",
            group.getId(), group.getExpiresAt());
    }

    /**
     * Grant a manual/trial entitlement.
     */
    @Transactional
    public CourseEntitlement grantManual(User user, Course course, String source, OffsetDateTime expiresAt) {
        return grantEntitlement(user, course, source, null, expiresAt);
    }

    /**
     * Revoke a specific entitlement immediately (e.g., owner removes seat).
     */
    @Transactional
    public void revoke(UUID entitlementId) {
        entitlementRepository.findById(entitlementId).ifPresent(e -> {
            e.setRevokedAt(OffsetDateTime.now());
            e.setActive(false);
            entitlementRepository.save(e);
            log.info("Revoked entitlement {} for user {} course {}",
                e.getId(), e.getUser().getId(), e.getCourse().getId());
        });
    }

    /**
     * Revoke all entitlements from a specific source (e.g., subscription canceled).
     */
    @Transactional
    public void revokeBySource(UUID sourceId, String source) {
        List<CourseEntitlement> entitlements = entitlementRepository.findBySourceIdAndSource(sourceId, source);
        OffsetDateTime now = OffsetDateTime.now();
        entitlements.forEach(e -> {
            e.setRevokedAt(now);
            e.setActive(false);
        });
        entitlementRepository.saveAll(entitlements);
        log.info("Revoked {} entitlements for source {} / {}", entitlements.size(), source, sourceId);
    }

    /**
     * Scheduled: deactivate expired entitlements every 5 minutes.
     */
    @Scheduled(fixedRate = 300_000)
    @Transactional
    public void deactivateExpiredEntitlements() {
        List<CourseEntitlement> expired = entitlementRepository.findExpiredEntitlements(OffsetDateTime.now());
        expired.forEach(e -> e.setActive(false));
        if (!expired.isEmpty()) {
            entitlementRepository.saveAll(expired);
            log.info("Deactivated {} expired entitlements", expired.size());
        }
    }

    private CourseEntitlement grantEntitlement(User user, Course course, String source,
                                                UUID sourceId, OffsetDateTime expiresAt) {
        // Upsert: search by the unique key (user_id, course_id) to avoid ConstraintViolation
        var existing = entitlementRepository.findByUserIdAndCourseId(user.getId(), course.getId());

        if (existing.isPresent()) {
            CourseEntitlement e = existing.get();
            
            // Reactivate and update source
            e.setActive(true);
            e.setRevokedAt(null);
            e.setSource(source);
            e.setSourceId(sourceId);
            
            // Extend or set expiration (only if new is later or if current is expired)
            if (expiresAt != null) {
                if (e.getExpiresAt() == null || expiresAt.isAfter(e.getExpiresAt()) || e.isExpired()) {
                    e.setExpiresAt(expiresAt);
                }
            } else {
                e.setExpiresAt(null); // No expiration = permanent access
            }
            
            log.info("Updated and reactivated entitlement for user {} course {}", user.getId(), course.getId());
            return entitlementRepository.save(e);
        }

        CourseEntitlement entitlement = CourseEntitlement.builder()
            .user(user)
            .course(course)
            .source(source)
            .sourceId(sourceId)
            .expiresAt(expiresAt)
            .active(true)
            .build();

        return entitlementRepository.save(entitlement);
    }
}
