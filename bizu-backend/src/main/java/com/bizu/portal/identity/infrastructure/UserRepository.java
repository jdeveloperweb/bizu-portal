package com.bizu.portal.identity.infrastructure;

import com.bizu.portal.identity.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface UserRepository extends JpaRepository<User, UUID> {
    Optional<User> findByEmail(String email);
    Optional<User> findByPhone(String phone);
    Optional<User> findByNickname(String nickname);
    java.util.List<User> findByNicknameContainingIgnoreCase(String nickname);
    
    @org.springframework.data.jpa.repository.Query(value = "SELECT DISTINCT u.* FROM identity.users u JOIN commerce.course_entitlements ce ON u.id = ce.user_id WHERE ce.course_id = :courseId AND ce.active = true AND u.id != :userId LIMIT :limit", nativeQuery = true)
    java.util.List<User> findSuggestedFriendsByCourseId(@org.springframework.data.repository.query.Param("courseId") UUID courseId, @org.springframework.data.repository.query.Param("userId") UUID userId, @org.springframework.data.repository.query.Param("limit") int limit);
    
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query(value = "UPDATE identity.users SET last_seen_at = NOW() WHERE id = :userId", nativeQuery = true)
    void updateLastSeen(@org.springframework.data.repository.query.Param("userId") UUID userId);

    org.springframework.data.domain.Page<User> findAll(org.springframework.data.domain.Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT u FROM User u WHERE LOWER(u.name) LIKE LOWER(CONCAT('%', :search, '%')) OR LOWER(u.email) LIKE LOWER(CONCAT('%', :search, '%'))")
    org.springframework.data.domain.Page<User> searchAll(String search, org.springframework.data.domain.Pageable pageable);

    long countByCreatedAtAfter(java.time.OffsetDateTime date);
    java.util.List<User> findTop10ByOrderByUpdatedAtDesc();

}
