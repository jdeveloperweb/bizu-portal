package com.bizu.portal.identity.infrastructure;

import com.bizu.portal.identity.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByNickname(String nickname);
    java.util.List<User> findByNicknameContainingIgnoreCase(String nickname);
    long countByCreatedAtAfter(java.time.OffsetDateTime date);
    java.util.List<User> findTop10ByOrderByUpdatedAtDesc();
}
