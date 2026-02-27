package com.bizu.portal.identity.infrastructure;

import com.bizu.portal.identity.domain.Friendship;
import com.bizu.portal.identity.domain.FriendshipStatus;
import com.bizu.portal.identity.domain.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface FriendshipRepository extends JpaRepository<Friendship, UUID> {
    
    Optional<Friendship> findByRequesterAndAddressee(User requester, User addressee);

    @Query("SELECT f FROM Friendship f WHERE (f.requester = :user OR f.addressee = :user) AND f.status = :status")
    List<Friendship> findByUserAndStatus(@Param("user") User user, @Param("status") FriendshipStatus status);
    
    @Query("SELECT f FROM Friendship f WHERE f.addressee = :user AND f.status = :status")
    List<Friendship> findByAddresseeAndStatus(@Param("user") User user, @Param("status") FriendshipStatus status);

    @Query("SELECT f FROM Friendship f WHERE ((f.requester = :user1 AND f.addressee = :user2) OR (f.requester = :user2 AND f.addressee = :user1))")
    Optional<Friendship> findFriendshipBetweenUsers(@Param("user1") User user1, @Param("user2") User user2);
}
