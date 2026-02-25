package com.bizu.portal.commerce.infrastructure;

import com.bizu.portal.commerce.domain.Subscription;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface SubscriptionRepository extends JpaRepository<Subscription, UUID> {
    long countByStatus(String status);
    java.util.List<Subscription> findAllByStatusIn(java.util.List<String> statuses);
    java.util.Optional<Subscription> findFirstByUserIdAndStatusInOrderByCreatedAtDesc(UUID userId, java.util.List<String> statuses);
}
