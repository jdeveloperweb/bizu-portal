package com.bizu.portal.commerce.infrastructure;

import com.bizu.portal.commerce.domain.Payment;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.UUID;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, UUID> {
    
    @Query("SELECT SUM(p.amount) FROM Payment p WHERE p.status = :status AND p.createdAt >= :date")
    BigDecimal sumAmountByStatusAndCreatedAtAfter(@Param("status") String status, @Param("date") OffsetDateTime date);

    @org.springframework.data.jpa.repository.EntityGraph(attributePaths = {"user"})
    List<Payment> findTop5ByOrderByCreatedAtDesc();

    List<Payment> findByUserIdOrderByCreatedAtDesc(UUID userId);

    java.util.Optional<Payment> findByStripeIntentId(String stripeIntentId);
}
