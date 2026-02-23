package com.bizu.portal.analytics.infrastructure;

import com.bizu.portal.analytics.domain.DailyActivity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.UUID;

@Repository
public interface DailyActivityRepository extends JpaRepository<DailyActivity, UUID> {
    
    boolean existsByUserIdAndActivityDate(UUID userId, LocalDate date);

    @Query("SELECT COUNT(DISTINCT d.userId) FROM DailyActivity d WHERE d.activityDate = :date")
    long countDistinctUserByActivityDate(LocalDate date);

    @Query("SELECT COUNT(DISTINCT d.userId) FROM DailyActivity d WHERE d.activityDate BETWEEN :start AND :end")
    long countDistinctUserByActivityDateBetween(LocalDate start, LocalDate end);
}
