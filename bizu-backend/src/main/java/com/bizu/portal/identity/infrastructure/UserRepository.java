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
    
    @org.springframework.data.jpa.repository.Query(value = "SELECT DISTINCT u.* FROM identity.users u JOIN commerce.course_entitlements ce ON u.id = ce.user_id WHERE ce.course_id = :courseId AND ce.active = true AND u.id != :userId LIMIT :limit", nativeQuery = true)
    java.util.List<User> findSuggestedFriendsByCourseId(@org.springframework.data.repository.query.Param("courseId") UUID courseId, @org.springframework.data.repository.query.Param("userId") UUID userId, @org.springframework.data.repository.query.Param("limit") int limit);
    
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(value = "UPDATE identity.users SET last_seen_at = NOW() WHERE id = :userId", nativeQuery = true)
    void updateLastSeen(@org.springframework.data.repository.query.Param("userId") UUID userId);

    long countByCreatedAtAfter(java.time.OffsetDateTime date);
    java.util.List<User> findTop10ByOrderByUpdatedAtDesc();
}
