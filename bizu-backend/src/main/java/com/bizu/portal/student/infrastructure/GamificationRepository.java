package com.bizu.portal.student.infrastructure;

import com.bizu.portal.student.domain.GamificationStats;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface GamificationRepository extends JpaRepository<GamificationStats, UUID> {
    
    @Query("SELECT g FROM GamificationStats g ORDER BY g.totalXp DESC")
    List<GamificationStats> findAllOrderByTotalXpDesc();

    java.util.Optional<GamificationStats> findByUserId(UUID userId);
}
