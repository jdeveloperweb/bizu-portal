package com.bizu.portal.commerce.api;

import com.bizu.portal.commerce.application.SubscriptionGroupService;
import com.bizu.portal.commerce.domain.SubscriptionGroup;
import com.bizu.portal.identity.application.UserService;
import com.bizu.portal.identity.domain.User;
import com.bizu.portal.identity.infrastructure.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.web.bind.annotation.*;

import java.util.UUID;

@RestController
@RequestMapping("/api/v1/subscriptions/group")
@RequiredArgsConstructor
public class SubscriptionGroupController {

    private final SubscriptionGroupService groupService;
    private final UserService userService;

    @GetMapping("/my-group")
    public ResponseEntity<SubscriptionGroup> getMyGroup(@AuthenticationPrincipal Jwt jwt) {
        UUID userId = resolveUserId(jwt);
        // For now, simplify finding group where user is owner
        return ResponseEntity.ok(groupService.findGroupByOwner(userId));
    }

    @PostMapping("/invite")
    public ResponseEntity<Void> inviteMember(@AuthenticationPrincipal Jwt jwt, @RequestParam String email) {
        UUID ownerId = resolveUserId(jwt);
        SubscriptionGroup group = groupService.findGroupByOwner(ownerId);
        groupService.addMember(group.getId(), email);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/members/{memberId}")
    public ResponseEntity<Void> removeMember(@AuthenticationPrincipal Jwt jwt, @PathVariable UUID memberId) {
        UUID ownerId = resolveUserId(jwt);
        SubscriptionGroup group = groupService.findGroupByOwner(ownerId);
        groupService.removeMember(group.getId(), memberId);
        return ResponseEntity.ok().build();
    }

    private UUID resolveUserId(Jwt jwt) {
        return userService.resolveUserId(jwt);
    }
}
