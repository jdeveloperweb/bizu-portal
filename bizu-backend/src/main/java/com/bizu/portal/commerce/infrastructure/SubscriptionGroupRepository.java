package com.bizu.portal.commerce.infrastructure;

import com.bizu.portal.commerce.domain.SubscriptionGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionGroupRepository extends JpaRepository<SubscriptionGroup, UUID> {
    Optional<SubscriptionGroup> findByOwnerId(UUID ownerId);
}
