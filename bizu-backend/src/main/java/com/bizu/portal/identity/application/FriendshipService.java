package com.bizu.portal.identity.application;

import com.bizu.portal.identity.domain.Friendship;
import com.bizu.portal.identity.domain.FriendshipStatus;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.FriendshipRepository;
import com.bizu.portal.identity.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Optional;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendshipService {
    private final FriendshipRepository friendshipRepository;
    private final UserRepository userRepository;

    @Transactional
    public Friendship sendRequest(UUID requesterId, UUID addresseeId) {
        User requester = userRepository.findById(requesterId)
            .orElseThrow(() -> new RuntimeException("Requester not found"));
        User addressee = userRepository.findById(addresseeId)
            .orElseThrow(() -> new RuntimeException("Addressee not found"));

        if (requester.getId().equals(addressee.getId())) {
            throw new RuntimeException("Cannot send friend request to yourself");
        }

        Optional<Friendship> existing = friendshipRepository.findFriendshipBetweenUsers(requester, addressee);
        if (existing.isPresent()) {
            throw new RuntimeException("Friendship or request already exists");
        }

        Friendship friendship = Friendship.builder()
            .requester(requester)
            .addressee(addressee)
            .status(FriendshipStatus.PENDING)
            .build();

        return friendshipRepository.save(friendship);
    }

    @Transactional
    public Friendship acceptRequest(UUID currentUserId, UUID friendshipId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
            .orElseThrow(() -> new RuntimeException("Friendship not found"));

        if (!friendship.getAddressee().getId().equals(currentUserId)) {
            throw new RuntimeException("Unauthorized to accept this request");
        }

        if (friendship.getStatus() != FriendshipStatus.PENDING) {
            throw new RuntimeException("Cannot accept non-pending request");
        }

        friendship.setStatus(FriendshipStatus.ACCEPTED);
        return friendshipRepository.save(friendship);
    }

    @Transactional
    public void rejectRequest(UUID currentUserId, UUID friendshipId) {
        Friendship friendship = friendshipRepository.findById(friendshipId)
            .orElseThrow(() -> new RuntimeException("Friendship not found"));

        if (!friendship.getAddressee().getId().equals(currentUserId) && !friendship.getRequester().getId().equals(currentUserId)) {
            throw new RuntimeException("Unauthorized to reject this request");
        }

        friendshipRepository.delete(friendship);
    }

    @Transactional(readOnly = true)
    public List<Friendship> getFriends(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return friendshipRepository.findByUserAndStatus(user, FriendshipStatus.ACCEPTED);
    }

    @Transactional(readOnly = true)
    public List<Friendship> getPendingRequests(UUID userId) {
        User user = userRepository.findById(userId)
            .orElseThrow(() -> new RuntimeException("User not found"));
        return friendshipRepository.findByAddresseeAndStatus(user, FriendshipStatus.PENDING);
    }

    @Transactional(readOnly = true)
    public List<User> searchUsersByNickname(String nickname) {
        return userRepository.findByNicknameContainingIgnoreCase(nickname);
    }
}
