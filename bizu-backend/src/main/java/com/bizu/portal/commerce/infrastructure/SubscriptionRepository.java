package com.bizu.portal.commerce.infrastructure;

import com.bizu.portal.commerce.domain.Subscription;
import org.springframework.data.jpa.repository.EntityGraph;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    long countByStatus(String status);
    java.util.List<Subscription> findAllByUserId(UUID userId);
    java.util.List<Subscription> findAllByStatusIn(java.util.List<String> statuses);
    
    @EntityGraph(attributePaths = {"plan", "plan.course"})
    java.util.List<Subscription> findAllByUserIdInAndStatusIn(java.util.Collection<UUID> userIds, java.util.List<String> statuses);


    @EntityGraph(attributePaths = {"user", "plan"})
    org.springframework.data.domain.Page<Subscription> findAll(org.springframework.data.domain.Pageable pageable);

    @EntityGraph(attributePaths = {"user", "plan"})
    @org.springframework.data.jpa.repository.Query("SELECT s FROM Subscription s WHERE LOWER(s.user.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.user.email) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(s.plan.name) LIKE LOWER(CONCAT('%', :search, '%'))")
    org.springframework.data.domain.Page<Subscription> searchAll(String search, org.springframework.data.domain.Pageable pageable);


    @EntityGraph(attributePaths = {"plan", "plan.course"})
    java.util.Optional<Subscription> findFirstByUserIdAndStatusInOrderByCreatedAtDesc(UUID userId, java.util.List<String> statuses);
}
