package com.bizu.portal.identity.api;

import com.bizu.portal.identity.api.dto.FriendshipDto;
import com.bizu.portal.identity.api.dto.UserProfileDto;
import com.bizu.portal.identity.application.FriendshipService;
import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.identity.domain.Friendship;
import com.bizu.portal.identity.domain.User;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/v1/friends")
@RequiredArgsConstructor
public class FriendshipController {
    
    private final FriendshipService friendshipService;
    private final UserService userService;

    private UUID getCurrentUserId(Jwt jwt) {
        return userService.resolveUserId(jwt);
    }

    private UserProfileDto toUserProfileDto(User user) {
        return new UserProfileDto(user.getId(), user.getNickname(), user.getName(), user.getAvatarUrl());
    }

    private FriendshipDto toFriendshipDto(Friendship f) {
        return new FriendshipDto(
            f.getId(),
            toUserProfileDto(f.getRequester()),
            toUserProfileDto(f.getAddressee()),
            f.getStatus().name(),
            f.getCreatedAt()
        );
    }

    @PostMapping("/request/{addresseeId}")
    public ResponseEntity<FriendshipDto> sendRequest(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID addresseeId) {
        Friendship f = friendshipService.sendRequest(getCurrentUserId(jwt), addresseeId);
        return ResponseEntity.ok(toFriendshipDto(f));
    }

    @PostMapping("/accept/{friendshipId}")
    public ResponseEntity<FriendshipDto> acceptRequest(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID friendshipId) {
        Friendship f = friendshipService.acceptRequest(getCurrentUserId(jwt), friendshipId);
        return ResponseEntity.ok(toFriendshipDto(f));
    }

    @DeleteMapping("/reject/{friendshipId}")
    public ResponseEntity<Void> rejectRequest(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID friendshipId) {
        friendshipService.rejectRequest(getCurrentUserId(jwt), friendshipId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping
    public ResponseEntity<List<FriendshipDto>> getFriends(@AuthenticationPrincipal Jwt jwt) {
        List<FriendshipDto> friends = friendshipService.getFriends(getCurrentUserId(jwt))
            .stream()
            .map(this::toFriendshipDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(friends);
    }

    @GetMapping("/pending")
    public ResponseEntity<List<FriendshipDto>> getPendingRequests(@AuthenticationPrincipal Jwt jwt) {
        List<FriendshipDto> pending = friendshipService.getPendingRequests(getCurrentUserId(jwt))
            .stream()
            .map(this::toFriendshipDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(pending);
    }

    @GetMapping("/search")
    public ResponseEntity<List<UserProfileDto>> searchUsers(@RequestParam String nickname) {
        List<UserProfileDto> users = friendshipService.searchUsersByNickname(nickname)
            .stream()
            .map(this::toUserProfileDto)
            .collect(Collectors.toList());
        return ResponseEntity.ok(users);
    }
}
