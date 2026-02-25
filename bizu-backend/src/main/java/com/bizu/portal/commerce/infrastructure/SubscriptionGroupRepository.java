package com.bizu.portal.commerce.infrastructure;

import com.bizu.portal.commerce.domain.SubscriptionGroup;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface SubscriptionGroupRepository extends JpaRepository<SubscriptionGroup, UUID> {
    Optional<SubscriptionGroup> findByOwnerId(UUID ownerId);

    @Query("SELECT sg FROM SubscriptionGroup sg LEFT JOIN sg.members m WHERE (sg.owner.id = :userId OR m.id = :userId) AND sg.active = true")
    List<SubscriptionGroup> findAllByUserIdAndActiveIsTrue(@Param("userId") UUID userId);
}
