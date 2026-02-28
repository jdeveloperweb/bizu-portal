package com.bizu.portal.identity.infrastructure;

import com.bizu.portal.identity.domain.VerificationCode;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface VerificationCodeRepository extends JpaRepository<VerificationCode, UUID> {

    Optional<VerificationCode> findTopByRecipientAndTypeAndUsedFalseOrderByCreatedAtDesc(String recipient, String type);

}
